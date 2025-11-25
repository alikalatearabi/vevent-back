import { Inject, Injectable, Logger, BadRequestException, NotFoundException, ConflictException, HttpException, HttpStatus, forwardRef } from '@nestjs/common';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly defaultEventPrice: number = parseFloat(process.env.DEFAULT_EVENT_PRICE || '150000'); // 150,000 IRR
  private readonly currency: string = process.env.PAYMENT_CURRENCY || 'IRR';

  constructor(
    @Inject('PRISMA') private readonly prisma: PrismaClient,
    private readonly paymentGatewayService: PaymentGatewayService,
    @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
  ) {}

  /**
   * Initiate payment for an event
   * @param userId Authenticated user ID
   * @param dto InitiatePaymentDto containing eventId
   * @returns Payment response with paymentId, paymentUrl, etc.
   */
  async initiatePayment(userId: string, dto: InitiatePaymentDto) {
    const { eventId } = dto;

    this.logger.log(`[Payment Initiation] Starting payment process for userId: ${userId}, eventId: ${eventId}`);

    // 1. Validate authentication (handled by AuthGuard)
    this.logger.debug(`[Payment Initiation] Step 1: Authentication validated (userId: ${userId})`);

    // 2. Validate input (handled by DTO decorators)
    this.logger.debug(`[Payment Initiation] Step 2: Input validated (eventId: ${eventId})`);

    // 3. Verify event exists
    this.logger.debug(`[Payment Initiation] Step 3: Fetching event from database`);
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        createdById: true,
        price: true,
        currency: true,
      },
    });

    if (!event) {
      this.logger.error(`[Payment Initiation] Event not found: ${eventId}`);
      throw new NotFoundException({
        success: false,
        message: 'رویداد یافت نشد',
        error: 'EVENT_NOT_FOUND',
      });
    }

    this.logger.log(`[Payment Initiation] Step 3: Event found - ${event.title} (${event.name})`);

    // 4. Verify user has registered for this event (or auto-register if not)
    this.logger.debug(`[Payment Initiation] Step 4: Checking if user is registered for event`);
    let attendee = await this.prisma.attendee.findFirst({
      where: {
        eventId,
        userId,
      },
    });

    // If not registered, auto-register the user
    if (!attendee) {
      this.logger.log(`[Payment Initiation] Step 4: User not registered, auto-registering...`);
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          company: true,
          jobTitle: true,
          phone: true,
        },
      });

      if (!user) {
        throw new BadRequestException({
          success: false,
          message: 'کاربر یافت نشد',
          error: 'USER_NOT_FOUND',
        });
      }

      // Auto-register user for the event
      attendee = await this.prisma.attendee.create({
        data: {
          event: { connect: { id: eventId } },
          user: { connect: { id: userId } },
          firstName: user.firstname,
          lastName: user.lastname,
          email: user.email,
          company: user.company,
          jobTitle: user.jobTitle,
          phone: user.phone,
        },
      });

      this.logger.log(`[Payment Initiation] Step 4: Auto-registered user ${userId} for event ${eventId}`);
      this.logger.debug(`[Payment Initiation] Attendee ID: ${attendee.id}`);
      
      // Notify event owner of new registration
      try {
        if (event.createdById) {
          await this.prisma.notification.create({
            data: {
              userId: event.createdById,
              message: `New attendee registered for event ${event.title}`,
              data: { attendeeId: attendee.id, eventId: eventId },
            },
          });
        }
      } catch (err) {
        // Swallow notification errors
        this.logger.warn('Failed to notify event owner', err);
      }
    } else {
      this.logger.debug(`[Payment Initiation] Step 4: User already registered (attendeeId: ${attendee.id})`);
    }

    // 5. Check existing payment
    this.logger.debug(`[Payment Initiation] Step 5: Checking for existing payments`);
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        userId,
        eventId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (existingPayment) {
      this.logger.log(`[Payment Initiation] Step 5: Found existing payment (ID: ${existingPayment.id}, Status: ${existingPayment.status})`);
      
      if (existingPayment.status === PaymentStatus.COMPLETED) {
        this.logger.warn(`[Payment Initiation] Payment already completed - rejecting new payment request`);
        throw new ConflictException({
          success: false,
          message: 'پرداخت شما برای این رویداد قبلاً انجام شده است',
          error: 'PAYMENT_ALREADY_COMPLETED',
          paymentId: existingPayment.id,
        });
      }

      if (existingPayment.status === PaymentStatus.FAILED) {
        // Delete failed payment to allow creating a new one (due to unique constraint on userId+eventId)
        this.logger.log(`[Payment Initiation] Step 5: Found failed payment, deleting it to allow new payment creation`);
        await this.prisma.payment.delete({
          where: { id: existingPayment.id },
        });
        this.logger.log(`[Payment Initiation] Step 5: Failed payment deleted, proceeding to create new payment`);
        // Continue to create new payment (fall through)
      }

      if (existingPayment.status === PaymentStatus.PENDING) {
        // Check if payment is too old (BitPay transactions expire after ~30 minutes)
        const paymentAge = Date.now() - existingPayment.createdAt.getTime();
        const maxPaymentAge = 30 * 60 * 1000; // 30 minutes in milliseconds
        const isExpired = paymentAge > maxPaymentAge;
        
        if (isExpired) {
          this.logger.warn(`[Payment Initiation] Step 5: Existing pending payment is expired (age: ${Math.floor(paymentAge / 1000 / 60)} minutes). Deleting expired payment and creating new one.`);
          
          // Delete expired payment to allow creating a new one (due to unique constraint on userId+eventId)
          await this.prisma.payment.delete({
            where: { id: existingPayment.id },
          });
          
          // Continue to create a new payment (fall through to payment creation logic)
          this.logger.log(`[Payment Initiation] Step 5: Expired payment deleted, proceeding to create new payment`);
        } else {
          // Payment is still valid, return it
          this.logger.log(`[Payment Initiation] Step 5: Returning existing pending payment (age: ${Math.floor(paymentAge / 1000 / 60)} minutes)`);
          
          // Get current event price (may have changed since payment was created)
          const currentEventPrice = event.price ? parseFloat(event.price.toString()) : this.defaultEventPrice;
          const currentEventCurrency = event.currency || this.currency;
          const storedAmount = existingPayment.amount.toNumber();
          
          // Check if event price has changed
          if (currentEventPrice !== storedAmount) {
            this.logger.warn(`[Payment Initiation] Step 5: ⚠️  Event price changed from ${storedAmount} to ${currentEventPrice}. Updating payment amount.`);
            
            // Update the payment record with new amount
            await this.prisma.payment.update({
              where: { id: existingPayment.id },
              data: {
                amount: currentEventPrice,
                currency: currentEventCurrency,
              },
            });
            
            this.logger.log(`[Payment Initiation] Step 5: Updated payment amount to ${currentEventPrice} ${currentEventCurrency}`);
          }
        
          // For BitPay, call gateway service to get fresh transaction ID
          let gatewayResponse = null;
          if (existingPayment.gateway === 'bitpay') {
            this.logger.debug(`[Payment Initiation] Step 5: Calling BitPay gateway for existing payment to get fresh transaction ID`);
            
            // BitPay may not accept query parameters in callback URL
            // We'll use BitPay's transaction ID to look up the payment in the callback
            const callbackUrl = process.env.PAYMENT_CALLBACK_URL || undefined;
            
            if (!callbackUrl) {
              this.logger.warn(`[Payment Initiation] Step 5: PAYMENT_CALLBACK_URL not configured`);
            } else {
              try {
                // Use current event price, not stored payment amount
                gatewayResponse = await this.paymentGatewayService.initiatePayment({
                  amount: currentEventPrice,
                  description: `پرداخت هزینه رویداد`,
                  callbackUrl,
                  metadata: {
                    paymentId: existingPayment.id,
                    eventId: existingPayment.eventId,
                  },
                });
                
                this.logger.log(`[Payment Initiation] Step 5: ✅ Got fresh transaction ID from BitPay: ${gatewayResponse.transactionId || gatewayResponse.id_get}`);
                
                // Store BitPay transaction ID in payment metadata
                if (gatewayResponse.transactionId || gatewayResponse.id_get) {
                  const metadata: any = existingPayment.metadata || {};
                  metadata.bitpayTransactionId = gatewayResponse.transactionId || gatewayResponse.id_get;
                  metadata.bitpayIdGet = gatewayResponse.id_get || gatewayResponse.transactionId;
                  
                  await this.prisma.payment.update({
                    where: { id: existingPayment.id },
                    data: {
                      metadata,
                      paymentUrl: gatewayResponse.paymentUrl,
                    },
                  });
                  
                  this.logger.debug(`[Payment Initiation] Step 5: Stored BitPay transaction ID in payment metadata: ${metadata.bitpayIdGet}`);
                }
              } catch (error) {
                this.logger.error(`[Payment Initiation] Step 5: Failed to get transaction ID from BitPay: ${error.message}`);
                // Continue with existing payment data if gateway call fails
              }
            }
          }
          
          // Return existing pending payment (with updated amount if changed)
          const response: any = {
            success: true,
            paymentId: existingPayment.id,
            paymentUrl: gatewayResponse?.paymentUrl || existingPayment.paymentUrl,
            status: existingPayment.status.toLowerCase(),
            amount: currentEventPrice, // Use current event price, not stored amount
            currency: currentEventCurrency, // Use current event currency
            gateway: existingPayment.gateway,
            authority: existingPayment.authority,
            message: 'در حال انتقال به درگاه پرداخت...',
          };
          
          // Add gateway response data if available (transactionId, formData, etc.)
          if (gatewayResponse) {
            if (gatewayResponse.transactionId) {
              response.transactionId = gatewayResponse.transactionId;
            }
            if (gatewayResponse.id_get) {
              response.id_get = gatewayResponse.id_get;
            }
            if (gatewayResponse.formData) {
              response.formData = gatewayResponse.formData;
            }
            this.logger.debug(`[Payment Initiation] Step 5: Added gateway response data (transactionId: ${gatewayResponse.transactionId || gatewayResponse.id_get})`);
          }
          
          return response;
        }
      }
    }

    // 6. Calculate payment amount
    // Use event price if available, otherwise use default from environment
    this.logger.debug(`[Payment Initiation] Step 6: Calculating payment amount`);
    const eventPrice = event.price ? parseFloat(event.price.toString()) : this.defaultEventPrice;
    const eventCurrency = event.currency || this.currency;
    const amount = eventPrice;
    this.logger.log(`[Payment Initiation] Step 6: Payment amount: ${amount} ${eventCurrency} (from ${event.price ? 'event' : 'default'})`);

    // 7. Create payment record
    this.logger.debug(`[Payment Initiation] Step 7: Creating payment record in database`);
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        eventId,
        attendeeId: attendee.id,
        amount,
        currency: this.currency,
        status: PaymentStatus.PENDING,
      },
    });

    this.logger.log(`[Payment Initiation] Step 7: Payment record created (ID: ${payment.id})`);

    // 8. Initiate payment gateway
    this.logger.debug(`[Payment Initiation] Step 8: Initiating payment gateway`);
    try {
      // BitPay may not accept query parameters in callback URL
      // We'll use BitPay's transaction ID to look up the payment in the callback
      const callbackUrl = process.env.PAYMENT_CALLBACK_URL || undefined;

      this.logger.log(`[Payment Initiation] Step 8: Callback URL: ${callbackUrl} (without query parameters for BitPay compatibility)`);
      this.logger.debug(`[Payment Initiation] Step 8: Calling payment gateway service`);

      const gatewayResponse = await this.paymentGatewayService.initiatePayment({
        amount,
        description: `پرداخت هزینه رویداد: ${event.title}`,
        callbackUrl,
        metadata: {
          eventId: event.id,
          eventName: event.name,
          eventTitle: event.title,
          userId,
          attendeeId: attendee.id,
          paymentId: payment.id, // Add paymentId to metadata for factorId
        },
      });

      this.logger.log(`[Payment Initiation] Step 8: Gateway response received`);
      this.logger.debug(`[Payment Initiation] Gateway success: ${gatewayResponse.success}`);
      this.logger.debug(`[Payment Initiation] Gateway authority: ${gatewayResponse.authority}`);
      this.logger.debug(`[Payment Initiation] Gateway paymentUrl: ${gatewayResponse.paymentUrl}`);
      if (gatewayResponse.formData) {
        this.logger.debug(`[Payment Initiation] Gateway formData keys: ${Object.keys(gatewayResponse.formData).join(', ')}`);
      }

      if (!gatewayResponse.success || !gatewayResponse.authority) {
        this.logger.error(`[Payment Initiation] Step 8: Gateway initiation failed`);
        this.logger.error(`[Payment Initiation] Gateway message: ${gatewayResponse.message}`);
        // Update payment status to failed
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            metadata: {
              error: gatewayResponse.message || 'خطا در اتصال به درگاه پرداخت',
            },
          },
        });

        throw new HttpException(
          {
            success: false,
            message: gatewayResponse.message || 'خطا در اتصال به درگاه پرداخت',
            error: 'GATEWAY_ERROR',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Update payment with gateway information
      this.logger.debug(`[Payment Initiation] Step 8: Updating payment with gateway information`);
      const gatewayName = process.env.PAYMENT_GATEWAY_NAME || 'zarinpal';
      this.logger.log(`[Payment Initiation] Step 8: Gateway name: ${gatewayName}`);
      
      // Store BitPay transaction ID in metadata for lookup during callback
      const metadata: any = payment.metadata || {};
      if (gatewayResponse.transactionId || gatewayResponse.id_get) {
        metadata.bitpayTransactionId = gatewayResponse.transactionId || gatewayResponse.id_get;
        metadata.bitpayIdGet = gatewayResponse.id_get || gatewayResponse.transactionId;
        this.logger.debug(`[Payment Initiation] Step 8: Storing BitPay transaction ID: ${metadata.bitpayIdGet}`);
      }
      
      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          gateway: gatewayName,
          authority: gatewayResponse.authority,
          paymentUrl: gatewayResponse.paymentUrl,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        },
      });

      this.logger.log(`[Payment Initiation] Step 8: Payment updated with gateway info (authority: ${updatedPayment.authority})`);

      // 9. Return payment response
      this.logger.debug(`[Payment Initiation] Step 9: Preparing response`);
      const response: any = {
        success: true,
        paymentId: updatedPayment.id,
        paymentUrl: updatedPayment.paymentUrl,
        status: updatedPayment.status.toLowerCase(),
        amount: updatedPayment.amount.toNumber(),
        currency: updatedPayment.currency,
        gateway: updatedPayment.gateway,
        authority: updatedPayment.authority,
        message: 'در حال انتقال به درگاه پرداخت...',
      };

      // Add BitPay form data and transaction ID if available
      if (gatewayResponse.formData) {
        // Ensure factorId is present (use payment ID as fallback)
        if (!gatewayResponse.formData.factorId) {
          gatewayResponse.formData.factorId = updatedPayment.id;
        }
        response.formData = gatewayResponse.formData;
        this.logger.debug(`[Payment Initiation] Step 9: Added formData to response`);
      }
      
      // Add transaction ID if available (for BitPay)
      if (gatewayResponse.transactionId) {
        response.transactionId = gatewayResponse.transactionId;
        this.logger.debug(`[Payment Initiation] Step 9: Added transactionId: ${gatewayResponse.transactionId}`);
      }
      if (gatewayResponse.id_get) {
        response.id_get = gatewayResponse.id_get;
        this.logger.debug(`[Payment Initiation] Step 9: Added id_get: ${gatewayResponse.id_get}`);
      }
      
      // Update paymentUrl if gateway provided a redirect URL
      if (gatewayResponse.paymentUrl) {
        response.paymentUrl = gatewayResponse.paymentUrl;
        this.logger.debug(`[Payment Initiation] Step 9: Updated paymentUrl: ${gatewayResponse.paymentUrl}`);
      }

      this.logger.log(`[Payment Initiation] ✅ Payment initiation completed successfully`);
      this.logger.log(`[Payment Initiation] Payment ID: ${response.paymentId}, Gateway: ${response.gateway}, Amount: ${response.amount} ${response.currency}`);
      
      return response;
    } catch (error) {
      // If error is already an HttpException, rethrow it
      if (error instanceof HttpException) {
        this.logger.error(`[Payment Initiation] ❌ HttpException: ${error.message}`);
        throw error;
      }

      // Log and handle unexpected errors
      this.logger.error(`[Payment Initiation] ❌ Unexpected error: ${error.message}`);
      this.logger.error(`[Payment Initiation] Error stack: ${error.stack}`);
      throw new HttpException(
        {
          success: false,
          message: 'خطا در ایجاد پرداخت',
          error: 'PAYMENT_INITIATION_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify payment
   * @param userId Authenticated user ID
   * @param dto VerifyPaymentDto containing paymentId and optional gateway data
   * @returns Verification response with payment status
   */
  async verifyPayment(userId: string, dto: VerifyPaymentDto) {
    const { paymentId, authority, status: gatewayStatus, id_get, trans_id } = dto;

    this.logger.log(`[Payment Verification] Starting verification for userId: ${userId}, paymentId: ${paymentId}`);
    this.logger.debug(`[Payment Verification] Parameters - authority: ${authority || 'N/A'}, id_get: ${id_get || 'N/A'}, trans_id: ${trans_id || 'N/A'}, gatewayStatus: ${gatewayStatus || 'N/A'}`);

    // 1. Validate authentication (handled by AuthGuard)
    this.logger.debug(`[Payment Verification] Step 1: Authentication validated (userId: ${userId})`);

    // 2. Retrieve payment record
    this.logger.debug(`[Payment Verification] Step 2: Fetching payment record from database`);
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            name: true,
          },
        },
      },
    });

    if (!payment) {
      this.logger.error(`[Payment Verification] Step 2: Payment not found: ${paymentId}`);
      throw new NotFoundException({
        success: false,
        message: 'پرداخت یافت نشد',
        error: 'PAYMENT_NOT_FOUND',
      });
    }

    this.logger.log(`[Payment Verification] Step 2: Payment found - Status: ${payment.status}, Amount: ${payment.amount.toNumber()} ${payment.currency}, Gateway: ${payment.gateway || 'N/A'}`);

    // 3. Verify payment belongs to authenticated user
    this.logger.debug(`[Payment Verification] Step 3: Verifying payment ownership`);
    if (payment.userId !== userId) {
      this.logger.warn(`[Payment Verification] Step 3: Access denied - Payment userId (${payment.userId}) does not match authenticated userId (${userId})`);
      throw new BadRequestException({
        success: false,
        message: 'شما دسترسی به این پرداخت ندارید',
        error: 'PAYMENT_ACCESS_DENIED',
      });
    }

    this.logger.debug(`[Payment Verification] Step 3: Payment ownership verified`);

    // 4. Check if already completed
    this.logger.debug(`[Payment Verification] Step 4: Checking payment status`);
    if (payment.status === PaymentStatus.COMPLETED) {
      this.logger.log(`[Payment Verification] Step 4: Payment already completed - returning existing status`);
      return {
        success: true,
        paymentId: payment.id,
        status: payment.status.toLowerCase(),
        refId: payment.refId,
        amount: payment.amount.toNumber(),
        currency: payment.currency,
        paidAt: payment.paidAt,
        message: 'این پرداخت قبلاً انجام شده است',
      };
    }

    // 5. Verify with payment gateway
    this.logger.debug(`[Payment Verification] Step 5: Starting gateway verification`);
    try {
      // Determine which gateway is being used
      const gateway = payment.gateway || process.env.PAYMENT_GATEWAY_NAME || 'zarinpal';
      this.logger.log(`[Payment Verification] Step 5: Gateway: ${gateway}`);
      
      let verificationResponse;
      
      if (gateway === 'bitpay') {
        this.logger.debug(`[Payment Verification] Step 5: Using BitPay verification`);
        // BitPay verification requires id_get and trans_id
        if (!id_get || !trans_id) {
          this.logger.error(`[Payment Verification] Step 5: BitPay verification failed - missing id_get or trans_id`);
          throw new BadRequestException({
            success: false,
            message: 'شناسه تراکنش BitPay یافت نشد (id_get و trans_id الزامی است)',
            error: 'BITPAY_TRANSACTION_ID_NOT_FOUND',
          });
        }

        this.logger.debug(`[Payment Verification] Step 5: Calling BitPay verification API`);
        verificationResponse = await this.paymentGatewayService.verifyPayment({
          authority: '', // Not used for BitPay
          amount: payment.amount.toNumber(),
          id_get,
          trans_id,
        });
      } else {
        // Zarinpal or other gateways use authority
        const authorityToVerify = authority || payment.authority;
        
        if (!authorityToVerify) {
          throw new BadRequestException({
            success: false,
            message: 'شناسه تراکنش یافت نشد',
            error: 'AUTHORITY_NOT_FOUND',
          });
        }

        this.logger.debug(`[Payment Verification] Step 5: Calling Zarinpal verification API`);
        this.logger.debug(`[Payment Verification] Step 5: Calling Zarinpal verification API with authority: ${authorityToVerify}`);
        verificationResponse = await this.paymentGatewayService.verifyPayment({
          authority: authorityToVerify,
          amount: payment.amount.toNumber(),
        });
      }

      this.logger.log(`[Payment Verification] Step 5: Gateway verification response received`);
      this.logger.debug(`[Payment Verification] Verification success: ${verificationResponse.success}`);
      this.logger.debug(`[Payment Verification] Verification status: ${verificationResponse.status}`);
      this.logger.debug(`[Payment Verification] Verification refId: ${verificationResponse.refId || 'N/A'}`);
      this.logger.debug(`[Payment Verification] Verification message: ${verificationResponse.message || 'N/A'}`);

      // 6. Update payment status based on gateway response
      this.logger.debug(`[Payment Verification] Step 6: Processing gateway response`);
      if (verificationResponse.success && verificationResponse.status === 'OK' && verificationResponse.refId) {
        this.logger.log(`[Payment Verification] Step 6: Payment verified successfully - updating to COMPLETED`);
        // Payment successful
        const updatedPayment = await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.COMPLETED,
            refId: verificationResponse.refId,
            paidAt: new Date(),
            metadata: {
              ...(payment.metadata as object || {}),
              verifiedAt: new Date().toISOString(),
            },
          },
        });

        this.logger.log(`[Payment Verification] Step 6: Payment status updated to COMPLETED (refId: ${updatedPayment.refId})`);

        // 7. Get updated user status flags
        this.logger.debug(`[Payment Verification] Step 7: Fetching user status flags`);
        const statusFlags = await this.usersService.getUserStatusFlags(userId);

        this.logger.log(`[Payment Verification] ✅ Payment verification completed successfully`);
        this.logger.log(`[Payment Verification] Payment ID: ${updatedPayment.id}, RefId: ${updatedPayment.refId}, Amount: ${updatedPayment.amount.toNumber()} ${updatedPayment.currency}`);

        return {
          success: true,
          paymentId: updatedPayment.id,
          status: updatedPayment.status.toLowerCase(),
          refId: updatedPayment.refId,
          amount: updatedPayment.amount.toNumber(),
          currency: updatedPayment.currency,
          paidAt: updatedPayment.paidAt,
          message: 'پرداخت با موفقیت انجام شد',
          user: {
            isProfileComplete: statusFlags.isProfileComplete,
            isEventRegistered: statusFlags.isEventRegistered,
            isPaymentComplete: statusFlags.isPaymentComplete,
          },
        };
      } else {
        // Payment failed
        this.logger.warn(`[Payment Verification] Step 6: Payment verification failed - updating to FAILED`);
        this.logger.warn(`[Payment Verification] Failure reason: ${verificationResponse.message || 'Unknown'}`);
        
        const updatedPayment = await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            metadata: {
              ...(payment.metadata as object || {}),
              verificationError: verificationResponse.message || 'پرداخت انجام نشد',
              verifiedAt: new Date().toISOString(),
            },
          },
        });

        this.logger.log(`[Payment Verification] ❌ Payment verification failed`);
        this.logger.log(`[Payment Verification] Payment ID: ${updatedPayment.id}, Status: ${updatedPayment.status}`);

        return {
          success: false,
          paymentId: updatedPayment.id,
          status: updatedPayment.status.toLowerCase(),
          message: verificationResponse.message || 'پرداخت انجام نشد',
          error: 'PAYMENT_FAILED',
        };
      }
    } catch (error) {
      // If error is already an HttpException, rethrow it
      if (error instanceof HttpException) {
        this.logger.error(`[Payment Verification] ❌ HttpException: ${error.message}`);
        throw error;
      }

      // Log and handle unexpected errors
      this.logger.error(`[Payment Verification] ❌ Unexpected error: ${error.message}`);
      this.logger.error(`[Payment Verification] Error stack: ${error.stack}`);
      
      // Update payment status to failed
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          metadata: {
            ...(payment.metadata as object || {}),
            verificationError: error.message,
          },
        },
      });

      throw new HttpException(
        {
          success: false,
          message: 'خطا در تایید پرداخت',
          error: 'PAYMENT_VERIFICATION_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Find payment by BitPay transaction ID
   * Used when BitPay redirects back with id_get but no paymentId
   */
  async findPaymentByBitPayTransactionId(bitpayTransactionId: string) {
    this.logger.debug(`[Payment Lookup] Searching for payment with BitPay transaction ID: ${bitpayTransactionId}`);
    
    // Search in metadata for BitPay transaction ID
    // Include both PENDING and COMPLETED payments (payment might be completed already)
    const payments = await this.prisma.payment.findMany({
      where: {
        gateway: 'bitpay',
        status: {
          in: [PaymentStatus.PENDING, PaymentStatus.COMPLETED],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    this.logger.debug(`[Payment Lookup] Found ${payments.length} BitPay payments to check`);
    
    // Filter payments that have matching BitPay transaction ID in metadata
    // Also try string comparison in case of type mismatches
    const searchId = bitpayTransactionId.toString().trim();
    for (const payment of payments) {
      const metadata = payment.metadata as any;
      if (metadata) {
        const storedTransactionId = metadata.bitpayTransactionId?.toString().trim();
        const storedIdGet = metadata.bitpayIdGet?.toString().trim();
        this.logger.debug(`[Payment Lookup] Checking payment ${payment.id} - storedTransactionId: ${storedTransactionId}, storedIdGet: ${storedIdGet}, searching for: ${searchId}`);
        if (storedTransactionId === searchId || 
            storedIdGet === searchId ||
            metadata.bitpayTransactionId === bitpayTransactionId || 
            metadata.bitpayIdGet === bitpayTransactionId) {
          this.logger.log(`[Payment Lookup] ✅ Found payment: ${payment.id} (status: ${payment.status}) for BitPay transaction ID: ${bitpayTransactionId}`);
          return payment;
        }
      } else {
        this.logger.debug(`[Payment Lookup] Payment ${payment.id} has no metadata`);
      }
    }
    
    // Fallback: Search all BitPay payments (including FAILED) if not found in PENDING/COMPLETED
    if (payments.length === 0 || payments.every(p => (p.metadata as any)?.bitpayTransactionId !== searchId && (p.metadata as any)?.bitpayIdGet !== searchId)) {
      this.logger.debug(`[Payment Lookup] Not found in PENDING/COMPLETED, searching all BitPay payments`);
      const allPayments = await this.prisma.payment.findMany({
        where: {
          gateway: 'bitpay',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50, // Limit to recent 50 payments
      });
      
      for (const payment of allPayments) {
        const metadata = payment.metadata as any;
        if (metadata) {
          const storedTransactionId = metadata.bitpayTransactionId?.toString().trim();
          const storedIdGet = metadata.bitpayIdGet?.toString().trim();
          if (storedTransactionId === searchId || 
              storedIdGet === searchId ||
              metadata.bitpayTransactionId === bitpayTransactionId || 
              metadata.bitpayIdGet === bitpayTransactionId) {
            this.logger.log(`[Payment Lookup] ✅ Found payment in fallback search: ${payment.id} (status: ${payment.status}) for BitPay transaction ID: ${bitpayTransactionId}`);
            return payment;
          }
        }
      }
    }
    
    this.logger.warn(`[Payment Lookup] ❌ No payment found for BitPay transaction ID: ${bitpayTransactionId}`);
    this.logger.warn(`[Payment Lookup] Searched ${payments.length} payments`);
    return null;
  }

  /**
   * Verify payment using BitPay parameters (public method, doesn't require userId)
   * Used by the callback endpoint
   */
  async verifyPaymentByBitPay(paymentId: string, id_get: string, trans_id: string) {
    this.logger.log(`[Payment Verification (BitPay)] Starting verification for paymentId: ${paymentId}, id_get: ${id_get}, trans_id: ${trans_id}`);
    
    // Get payment first
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            name: true,
          },
        },
      },
    });
    
    if (!payment) {
      this.logger.error(`[Payment Verification (BitPay)] Payment not found: ${paymentId}`);
      throw new NotFoundException({
        success: false,
        message: 'پرداخت یافت نشد',
        error: 'PAYMENT_NOT_FOUND',
      });
    }
    
    this.logger.log(`[Payment Verification (BitPay)] Payment found - Status: ${payment.status}, Amount: ${payment.amount.toNumber()} ${payment.currency}`);
    
    // Check if already completed
    if (payment.status === PaymentStatus.COMPLETED) {
      this.logger.log(`[Payment Verification (BitPay)] Payment already completed`);
      return {
        success: true,
        paymentId: payment.id,
        status: 'completed',
        refId: payment.refId,
        amount: payment.amount.toNumber(),
        currency: payment.currency,
        paidAt: payment.paidAt,
        message: 'پرداخت قبلاً انجام شده است',
      };
    }
    
    // Call gateway verification
    this.logger.debug(`[Payment Verification (BitPay)] Calling payment gateway service`);
    const gatewayResponse = await this.paymentGatewayService.verifyPayment({
      authority: payment.authority || '',
      amount: payment.amount.toNumber(),
      id_get,
      trans_id,
    });
    
    this.logger.log(`[Payment Verification (BitPay)] Gateway response - Success: ${gatewayResponse.success}, Status: ${gatewayResponse.status}`);
    
    // Update payment status
    if (gatewayResponse.success && gatewayResponse.status === 'OK') {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.COMPLETED,
          refId: gatewayResponse.refId,
          paidAt: new Date(),
        },
      });
      
      this.logger.log(`[Payment Verification (BitPay)] ✅ Payment verified and updated to COMPLETED`);
      
      return {
        success: true,
        paymentId: payment.id,
        status: 'completed',
        refId: gatewayResponse.refId,
        amount: payment.amount.toNumber(),
        currency: payment.currency,
        paidAt: new Date(),
        message: gatewayResponse.message || 'پرداخت با موفقیت انجام شد',
      };
    } else {
      // Update payment status to failed
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.FAILED,
        },
      });
      
      this.logger.warn(`[Payment Verification (BitPay)] ❌ Payment verification failed`);
      
      return {
        success: false,
        paymentId: payment.id,
        status: 'failed',
        message: gatewayResponse.message || 'پرداخت انجام نشد',
      };
    }
  }
}


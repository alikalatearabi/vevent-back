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

    // 1. Validate authentication (handled by AuthGuard)

    // 2. Validate input (handled by DTO decorators)

    // 3. Verify event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        createdById: true,
      },
    });

    if (!event) {
      throw new NotFoundException({
        success: false,
        message: 'رویداد یافت نشد',
        error: 'EVENT_NOT_FOUND',
      });
    }

    // 4. Verify user has registered for this event (or auto-register if not)
    let attendee = await this.prisma.attendee.findFirst({
      where: {
        eventId,
        userId,
      },
    });

    // If not registered, auto-register the user
    if (!attendee) {
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

      this.logger.log(`Auto-registered user ${userId} for event ${eventId} during payment initiation`);
      
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
    }

    // 5. Check existing payment
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
      if (existingPayment.status === PaymentStatus.COMPLETED) {
        throw new ConflictException({
          success: false,
          message: 'پرداخت شما برای این رویداد قبلاً انجام شده است',
          error: 'PAYMENT_ALREADY_COMPLETED',
          paymentId: existingPayment.id,
        });
      }

      if (existingPayment.status === PaymentStatus.PENDING) {
        // Return existing pending payment
        return {
          success: true,
          paymentId: existingPayment.id,
          paymentUrl: existingPayment.paymentUrl,
          status: existingPayment.status.toLowerCase(),
          amount: existingPayment.amount.toNumber(),
          currency: existingPayment.currency,
          gateway: existingPayment.gateway,
          authority: existingPayment.authority,
          message: 'در حال انتقال به درگاه پرداخت...',
        };
      }
    }

    // 6. Calculate payment amount
    // For now, use default price. In the future, this can come from event metadata
    const amount = this.defaultEventPrice;

    // 7. Create payment record
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

    // 8. Initiate payment gateway
    try {
      const callbackUrl = process.env.PAYMENT_CALLBACK_URL 
        ? `${process.env.PAYMENT_CALLBACK_URL}?paymentId=${payment.id}`
        : undefined;

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
        },
      });

      if (!gatewayResponse.success || !gatewayResponse.authority) {
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
      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          gateway: 'zarinpal', // or from env
          authority: gatewayResponse.authority,
          paymentUrl: gatewayResponse.paymentUrl,
        },
      });

      // 9. Return payment response
      return {
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
    } catch (error) {
      // If error is already an HttpException, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }

      // Log and handle unexpected errors
      this.logger.error(`Error initiating payment: ${error.message}`);
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
    const { paymentId, authority, status: gatewayStatus } = dto;

    // 1. Validate authentication (handled by AuthGuard)

    // 2. Retrieve payment record
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
      throw new NotFoundException({
        success: false,
        message: 'پرداخت یافت نشد',
        error: 'PAYMENT_NOT_FOUND',
      });
    }

    // 3. Verify payment belongs to authenticated user
    if (payment.userId !== userId) {
      throw new BadRequestException({
        success: false,
        message: 'شما دسترسی به این پرداخت ندارید',
        error: 'PAYMENT_ACCESS_DENIED',
      });
    }

    // 4. Check if already completed
    if (payment.status === PaymentStatus.COMPLETED) {
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
    try {
      // Use provided authority or payment's authority
      const authorityToVerify = authority || payment.authority;
      
      if (!authorityToVerify) {
        throw new BadRequestException({
          success: false,
          message: 'شناسه تراکنش یافت نشد',
          error: 'AUTHORITY_NOT_FOUND',
        });
      }

      const verificationResponse = await this.paymentGatewayService.verifyPayment({
        authority: authorityToVerify,
        amount: payment.amount.toNumber(),
      });

      // 6. Update payment status based on gateway response
      if (verificationResponse.success && verificationResponse.status === 'OK' && verificationResponse.refId) {
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

        // 7. Get updated user status flags
        const statusFlags = await this.usersService.getUserStatusFlags(userId);

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
        throw error;
      }

      // Log and handle unexpected errors
      this.logger.error(`Error verifying payment: ${error.message}`);
      
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
}


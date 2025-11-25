import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@ApiTags('Payments')
@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('initiate')
  @ApiOperation({ summary: 'Initiate payment for an event' })
  @ApiResponse({ status: 200, description: 'Payment initiated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Event not registered or invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 409, description: 'Payment already completed' })
  async initiatePayment(@Body() dto: InitiatePaymentDto, @Req() req: any) {
    const userId = req.user.sub;
    console.log(`[Payment Controller] Initiate payment request - userId: ${userId}, eventId: ${dto.eventId}`);
    
    const response = await this.paymentsService.initiatePayment(userId, dto);
    
    // Log the full response being sent to frontend
    console.log(`[Payment Controller] Response to frontend:`, JSON.stringify(response, null, 2));
    
    // Also log formData separately if it exists (for easier debugging)
    if (response.formData) {
      console.log(`[Payment Controller] FormData being sent:`, JSON.stringify(response.formData, null, 2));
      console.log(`[Payment Controller] Payment URL: ${response.paymentUrl}`);
      console.log(`[Payment Controller] Gateway: ${response.gateway}`);
    }
    
    return response;
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post('verify')
  @ApiOperation({ summary: 'Verify payment status' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input or payment access denied' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async verifyPayment(@Body() dto: VerifyPaymentDto, @Req() req: any) {
    const userId = req.user.sub;
    console.log(`[Payment Controller] Verify payment request - userId: ${userId}, paymentId: ${dto.paymentId}`);
    console.log(`[Payment Controller] Verification params - authority: ${dto.authority || 'N/A'}, id_get: ${dto.id_get || 'N/A'}, trans_id: ${dto.trans_id || 'N/A'}`);
    return this.paymentsService.verifyPayment(userId, dto);
  }

  /**
   * BitPay callback endpoint - called by BitPay after payment
   * This endpoint doesn't require authentication as it's called by BitPay
   */
  @Get('callback/bitpay')
  @ApiOperation({ summary: 'BitPay payment callback (public endpoint)' })
  @ApiQuery({ name: 'paymentId', required: true, description: 'Payment ID' })
  @ApiQuery({ name: 'id_get', required: false, description: 'BitPay transaction ID' })
  @ApiQuery({ name: 'trans_id', required: false, description: 'BitPay transaction ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Payment status from BitPay' })
  @ApiResponse({ status: 200, description: 'Callback processed' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid parameters' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async bitpayCallback(@Query() query: any) {
    // Extract parameters from query string
    const { paymentId, id_get, trans_id, status } = query;
    
    console.log(`[Payment Controller] BitPay callback received`);
    console.log(`[Payment Controller] Callback params - paymentId: ${paymentId || 'N/A'}, id_get: ${id_get || 'N/A'}, trans_id: ${trans_id || 'N/A'}, status: ${status || 'N/A'}`);
    console.log(`[Payment Controller] Full query params:`, JSON.stringify(query));
    
    // If we have id_get but no paymentId, try to find payment by BitPay transaction ID
    if (id_get && !paymentId) {
      console.log(`[Payment Controller] Looking up payment by BitPay transaction ID: ${id_get}`);
      const payment = await this.paymentsService.findPaymentByBitPayTransactionId(id_get);
      if (payment) {
        console.log(`[Payment Controller] Found payment: ${payment.id}, attempting automatic verification`);
        // Automatically verify the payment
        try {
          if (trans_id) {
            const verifyResult = await this.paymentsService.verifyPaymentByBitPay(
              payment.id,
              id_get,
              trans_id
            );
            console.log(`[Payment Controller] Verification result:`, JSON.stringify(verifyResult));
            return verifyResult;
          } else {
            console.log(`[Payment Controller] trans_id missing, returning payment info for frontend verification`);
            return {
              success: true,
              paymentId: payment.id,
              id_get,
              trans_id,
              status,
              message: 'Please verify payment using the verify endpoint',
            };
          }
        } catch (error) {
          console.error(`[Payment Controller] Error during automatic verification:`, error);
          return {
            success: false,
            message: 'خطا در تأیید پرداخت',
            error: error.message,
            paymentId: payment.id,
            id_get,
            trans_id,
          };
        }
      } else {
        console.warn(`[Payment Controller] Payment not found for BitPay transaction ID: ${id_get}`);
        return {
          success: false,
          message: 'شناسه پرداخت یافت نشد',
          error: 'PAYMENT_NOT_FOUND',
          id_get,
        };
      }
    }
    
    // If paymentId is provided, return it for frontend to verify
    // Or if we have all required parameters, try to verify
    if (paymentId && id_get && trans_id) {
      console.log(`[Payment Controller] All parameters present, attempting automatic verification`);
      try {
        const verifyResult = await this.paymentsService.verifyPaymentByBitPay(
          paymentId,
          id_get,
          trans_id
        );
        console.log(`[Payment Controller] Verification result:`, JSON.stringify(verifyResult));
        return verifyResult;
      } catch (error) {
        console.error(`[Payment Controller] Error during automatic verification:`, error);
        return {
          success: false,
          message: 'خطا در تأیید پرداخت',
          error: error.message,
          paymentId,
          id_get,
          trans_id,
        };
      }
    }
    
    // Fallback: return parameters for frontend to verify
    return {
      success: true,
      message: 'Please verify payment using the verify endpoint',
      paymentId,
      id_get,
      trans_id,
      status,
    };
  }
}


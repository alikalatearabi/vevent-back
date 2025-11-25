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
    return this.paymentsService.initiatePayment(userId, dto);
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
    
    // This will be handled by the frontend, but we can also return redirect info
    // The frontend should call the verify endpoint with these parameters
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


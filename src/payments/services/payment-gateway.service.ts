import { Injectable, Logger } from '@nestjs/common';

interface PaymentRequest {
  amount: number;
  description: string;
  callbackUrl?: string;
  metadata?: any;
}

interface PaymentResponse {
  success: boolean;
  authority: string;
  paymentUrl?: string;
  message?: string;
}

interface VerificationRequest {
  authority: string;
  amount: number;
}

interface VerificationResponse {
  success: boolean;
  refId?: string;
  status: 'OK' | 'NOK';
  message?: string;
}

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);
  private readonly mockMode: boolean = process.env.PAYMENT_GATEWAY_MOCK !== 'false'; // Default to true unless explicitly disabled
  private readonly gatewayName: string = process.env.PAYMENT_GATEWAY_NAME || 'zarinpal';

  /**
   * Initiate payment with gateway
   * @param request Payment request details
   * @returns Payment response with authority and payment URL
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (this.mockMode) {
      return this.initiateMockPayment(request);
    }

    // TODO: Implement real payment gateway integration (Zarinpal, etc.)
    // Example:
    // return this.initiateRealPayment(request);
    
    this.logger.warn('Real payment gateway not implemented yet, falling back to mock');
    return this.initiateMockPayment(request);
  }

  /**
   * Verify payment with gateway
   * @param request Verification request details
   * @returns Verification response with refId and status
   */
  async verifyPayment(request: VerificationRequest): Promise<VerificationResponse> {
    if (this.mockMode) {
      return this.verifyMockPayment(request);
    }

    // TODO: Implement real payment gateway verification
    // Example:
    // return this.verifyRealPayment(request);
    
    this.logger.warn('Real payment gateway verification not implemented yet, falling back to mock');
    return this.verifyMockPayment(request);
  }

  /**
   * Mock payment initiation - always succeeds
   */
  private async initiateMockPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Generate mock authority (gateway transaction ID)
    const authority = this.generateAuthority();
    
    // Generate mock payment URL
    const paymentUrl = this.generatePaymentUrl(authority);
    
    this.logger.log(`[Payment Gateway Mock] Initiating payment: ${request.amount} IRR`);
    this.logger.debug(`[Payment Gateway Mock] Authority: ${authority}`);
    this.logger.debug(`[Payment Gateway Mock] Payment URL: ${paymentUrl}`);
    
    // Simulate API call delay (100-300ms)
    const delay = Math.floor(Math.random() * 200) + 100;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      success: true,
      authority,
      paymentUrl,
      message: 'در حال انتقال به درگاه پرداخت...',
    };
  }

  /**
   * Mock payment verification - simulates success/failure
   */
  private async verifyMockPayment(request: VerificationRequest): Promise<VerificationResponse> {
    this.logger.log(`[Payment Gateway Mock] Verifying payment: Authority ${request.authority}, Amount: ${request.amount} IRR`);
    
    // Simulate API call delay (100-300ms)
    const delay = Math.floor(Math.random() * 200) + 100;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // In mock mode, simulate success (90% success rate for testing)
    // You can change this to always succeed or always fail for testing
    const shouldSucceed = process.env.PAYMENT_MOCK_SUCCESS_RATE 
      ? Math.random() < parseFloat(process.env.PAYMENT_MOCK_SUCCESS_RATE)
      : true; // Default to always succeed
    
    if (shouldSucceed) {
      // Generate mock reference ID
      const refId = this.generateRefId();
      
      this.logger.debug(`[Payment Gateway Mock] Payment verified successfully: RefId ${refId}`);
      
      return {
        success: true,
        refId,
        status: 'OK',
        message: 'پرداخت با موفقیت انجام شد',
      };
    } else {
      this.logger.debug(`[Payment Gateway Mock] Payment verification failed`);
      
      return {
        success: false,
        status: 'NOK',
        message: 'پرداخت انجام نشد',
      };
    }
  }

  /**
   * Generate mock authority (gateway transaction ID)
   */
  private generateAuthority(): string {
    // Generate a 32-character hex string (similar to Zarinpal authority)
    const chars = '0123456789abcdef';
    let authority = '';
    for (let i = 0; i < 32; i++) {
      authority += chars[Math.floor(Math.random() * chars.length)];
    }
    return authority.toUpperCase();
  }

  /**
   * Generate mock payment URL
   */
  private generatePaymentUrl(authority: string): string {
    const baseUrl = process.env.PAYMENT_GATEWAY_BASE_URL || 'https://gateway.zarinpal.com/pg/StartPay';
    return `${baseUrl}/${authority}`;
  }

  /**
   * Generate mock reference ID
   */
  private generateRefId(): string {
    // Generate a 10-digit number (similar to Zarinpal refId)
    const min = 1000000000;
    const max = 9999999999;
    return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
  }

  /**
   * Future: Implement real Zarinpal payment gateway integration
   */
  /*
  private async initiateRealPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const merchantId = process.env.ZARINPAL_MERCHANT_ID;
      const isSandbox = process.env.ZARINPAL_SANDBOX === 'true';
      
      const zarinpalUrl = isSandbox 
        ? 'https://sandbox.zarinpal.com/pg/v4/payment/request.json'
        : 'https://api.zarinpal.com/pg/v4/payment/request.json';

      const response = await axios.post(zarinpalUrl, {
        merchant_id: merchantId,
        amount: request.amount,
        description: request.description,
        callback_url: request.callbackUrl,
        metadata: request.metadata,
      });

      if (response.data.data.code === 100) {
        const authority = response.data.data.authority;
        const paymentUrl = `https://${isSandbox ? 'sandbox.' : ''}zarinpal.com/pg/StartPay/${authority}`;
        
        return {
          success: true,
          authority,
          paymentUrl,
        };
      } else {
        throw new Error(`Payment gateway error: ${response.data.errors.message}`);
      }
    } catch (error) {
      this.logger.error(`Error initiating payment: ${error.message}`);
      throw error;
    }
  }

  private async verifyRealPayment(request: VerificationRequest): Promise<VerificationResponse> {
    try {
      const merchantId = process.env.ZARINPAL_MERCHANT_ID;
      const isSandbox = process.env.ZARINPAL_SANDBOX === 'true';
      
      const zarinpalUrl = isSandbox 
        ? 'https://sandbox.zarinpal.com/pg/v4/payment/verify.json'
        : 'https://api.zarinpal.com/pg/v4/payment/verify.json';

      const response = await axios.post(zarinpalUrl, {
        merchant_id: merchantId,
        authority: request.authority,
        amount: request.amount,
      });

      if (response.data.data.code === 100) {
        return {
          success: true,
          refId: response.data.data.ref_id.toString(),
          status: 'OK',
          message: 'پرداخت با موفقیت انجام شد',
        };
      } else {
        return {
          success: false,
          status: 'NOK',
          message: response.data.errors?.message || 'پرداخت انجام نشد',
        };
      }
    } catch (error) {
      this.logger.error(`Error verifying payment: ${error.message}`);
      return {
        success: false,
        status: 'NOK',
        message: 'خطا در ارتباط با درگاه پرداخت',
      };
    }
  }
  */
}


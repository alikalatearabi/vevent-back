import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

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
  // BitPay specific fields
  formData?: Record<string, string>; // For BitPay form submission
  transactionId?: string; // The id_get from BitPay
  id_get?: string; // Alternative name for transactionId (for compatibility)
}

interface VerificationRequest {
  authority: string;
  amount: number;
  // BitPay specific fields
  id_get?: string;
  trans_id?: string;
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
    this.logger.log(`[Gateway] Initiating payment - Amount: ${request.amount} ${request.description ? `(${request.description})` : ''}`);
    this.logger.debug(`[Gateway] Mock mode: ${this.mockMode}, Gateway: ${this.gatewayName}`);
    
    if (this.mockMode) {
      this.logger.warn(`[Gateway] Using MOCK mode for payment initiation`);
      return this.initiateMockPayment(request);
    }

    // Route to appropriate gateway based on configuration
    if (this.gatewayName === 'bitpay') {
      this.logger.log(`[Gateway] Routing to BitPay gateway`);
      return this.initiateBitPayPayment(request);
    } else if (this.gatewayName === 'zarinpal') {
      this.logger.log(`[Gateway] Routing to Zarinpal gateway`);
      return this.initiateZarinpalPayment(request);
    }
    
    this.logger.warn(`[Gateway] Unknown gateway: ${this.gatewayName}, falling back to mock`);
    return this.initiateMockPayment(request);
  }

  /**
   * Verify payment with gateway
   * @param request Verification request details
   * @returns Verification response with refId and status
   */
  async verifyPayment(request: VerificationRequest): Promise<VerificationResponse> {
    this.logger.log(`[Gateway] Verifying payment - Amount: ${request.amount}`);
    this.logger.debug(`[Gateway] Authority: ${request.authority || 'N/A'}, id_get: ${request.id_get || 'N/A'}, trans_id: ${request.trans_id || 'N/A'}`);
    this.logger.debug(`[Gateway] Mock mode: ${this.mockMode}, Gateway: ${this.gatewayName}`);
    
    if (this.mockMode) {
      this.logger.warn(`[Gateway] Using MOCK mode for payment verification`);
      return this.verifyMockPayment(request);
    }

    // Route to appropriate gateway based on configuration
    if (this.gatewayName === 'bitpay') {
      this.logger.log(`[Gateway] Routing to BitPay verification`);
      return this.verifyBitPayPayment(request);
    } else if (this.gatewayName === 'zarinpal') {
      this.logger.log(`[Gateway] Routing to Zarinpal verification`);
      return this.verifyZarinpalPayment(request);
    }
    
    this.logger.warn(`[Gateway] Unknown gateway: ${this.gatewayName}, falling back to mock`);
    return this.verifyMockPayment(request);
  }

  /**
   * Initiate BitPay payment
   * Note: BitPay requires browser form submission, not server-side API calls
   * This method prepares the form data for the frontend to submit
   */
  private async initiateBitPayPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const apiKey = process.env.BITPAY_API_KEY;
      const testModeEnv = process.env.BITPAY_TEST_MODE;
      const isTest = testModeEnv !== 'false'; // Default to test mode
      
      this.logger.debug(`[BitPay] BITPAY_TEST_MODE env value: "${testModeEnv}" (type: ${typeof testModeEnv})`);
      this.logger.debug(`[BitPay] isTest calculated: ${isTest}`);
      this.logger.debug(`[BitPay] Will use ${isTest ? 'TEST' : 'PRODUCTION'} URL`);
      
      if (!apiKey) {
        throw new Error('BITPAY_API_KEY is not configured');
      }

      if (!request.callbackUrl) {
        throw new Error('Callback URL is required for BitPay');
      }

      const bitpayUrl = isTest 
        ? 'https://bitpay.ir/payment-test/gateway-send'
        : 'https://bitpay.ir/payment/gateway-send';
      
      this.logger.debug(`[BitPay] Selected URL: ${bitpayUrl}`);
      
      // BitPay expects amounts in Tomans, not Rials!
      // Convert Rials to Tomans (divide by 10)
      // 1 Toman = 10 Rials
      const amountInRials = Math.floor(request.amount);
      const amountInTomans = Math.floor(amountInRials / 10);
      
      // BitPay minimum is 500 Tomans (5000 Rials)
      if (amountInTomans < 500) {
        throw new Error(`Amount too low: ${amountInTomans} Tomans (${amountInRials} Rials). Minimum: 500 Tomans (5000 Rials)`);
      }
      
      this.logger.log(`[BitPay] Preparing payment: ${amountInTomans} Tomans (${amountInRials} Rials)`);
      this.logger.debug(`[BitPay] URL: ${bitpayUrl}`);
      this.logger.debug(`[BitPay] Callback URL: ${request.callbackUrl}`);
      this.logger.debug(`[BitPay] API Key: ${apiKey.substring(0, 10)}...`);
      
      // Generate a temporary authority for tracking
      const authority = this.generateAuthority();
      
      // Prepare form data for BitPay - use Tomans, not Rials
      const factorId = request.metadata?.paymentId || request.metadata?.eventId || authority;
      const formDataToSend = new URLSearchParams();
      formDataToSend.append('api', apiKey);
      formDataToSend.append('amount', amountInTomans.toString()); // Send Tomans to BitPay
      formDataToSend.append('redirect', request.callbackUrl);
      formDataToSend.append('factorId', factorId);
      
      this.logger.log(`[BitPay] Calling BitPay gateway-send server-side: ${bitpayUrl}`);
      this.logger.debug(`[BitPay] Request data: api=${apiKey.substring(0, 10)}..., amount=${amountInTomans} Tomans (${amountInRials} Rials), redirect=${request.callbackUrl}, factorId=${factorId}`);
      
      // Call BitPay server-side to get transaction ID
      const response = await axios.post(bitpayUrl, formDataToSend, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      });
      
      // BitPay returns the transaction ID as plain text
      const transactionId = response.data?.toString().trim();
      
      this.logger.debug(`[BitPay] Raw response from BitPay: ${transactionId}`);
      
      // Validate transaction ID (should be a positive number, not an error code like -1, -2, etc.)
      if (!transactionId || transactionId.startsWith('-') || isNaN(parseInt(transactionId))) {
        this.logger.error(`[BitPay] Invalid transaction ID received: ${transactionId}`);
        throw new Error(`BitPay returned error: ${transactionId}`);
      }
      
      this.logger.log(`[BitPay] ✅ Transaction ID received: ${transactionId}`);
      
      // Construct the payment URL that frontend should redirect to
      const paymentRedirectUrl = bitpayUrl.replace('/gateway-send', `/gateway-${transactionId}-get`);
      this.logger.debug(`[BitPay] Payment redirect URL: ${paymentRedirectUrl}`);
      
      return {
        success: true,
        authority,
        paymentUrl: paymentRedirectUrl, // URL to redirect to (gateway-{id_get}-get)
        transactionId: transactionId,
        id_get: transactionId, // Also include as id_get for compatibility
        formData: {
          api: apiKey,
          amount: amountInTomans.toString(), // Send Tomans to BitPay (not Rials)
          redirect: request.callbackUrl,
          factorId: factorId,
        },
        message: 'در حال انتقال به درگاه پرداخت...',
      };
    } catch (error) {
      this.logger.error(`[BitPay] Error initiating payment: ${error.message}`);
      if (axios.isAxiosError(error)) {
        this.logger.error(`[BitPay] Response status: ${error.response?.status}`);
        this.logger.error(`[BitPay] Response data: ${error.response?.data}`);
        if (error.response?.data) {
          const errorMessage = error.response.data.toString().trim();
          this.logger.error(`[BitPay] BitPay error code: ${errorMessage}`);
        }
      }
      throw new Error(`BitPay payment initiation failed: ${error.message}`);
    }
  }

  /**
   * Verify BitPay payment
   */
  private async verifyBitPayPayment(request: VerificationRequest): Promise<VerificationResponse> {
    try {
      const apiKey = process.env.BITPAY_API_KEY;
      const isTest = process.env.BITPAY_TEST_MODE !== 'false';
      
      if (!apiKey) {
        throw new Error('BITPAY_API_KEY is not configured');
      }

      if (!request.id_get || !request.trans_id) {
        throw new Error('BitPay verification requires id_get and trans_id');
      }

      const bitpayUrl = isTest 
        ? 'https://bitpay.ir/payment-test/gateway-result-second'
        : 'https://bitpay.ir/payment/gateway-result-second';
      
      this.logger.log(`[BitPay] Verifying payment: id_get=${request.id_get}, trans_id=${request.trans_id}`);
      
      const formData = new URLSearchParams();
      formData.append('api', apiKey);
      formData.append('id_get', request.id_get);
      formData.append('trans_id', request.trans_id);
      formData.append('json', '1'); // Request JSON response
      
      this.logger.debug(`[BitPay Verification] Request URL: ${bitpayUrl}`);
      this.logger.debug(`[BitPay Verification] Request parameters: id_get=${request.id_get}, trans_id=${request.trans_id}`);
      this.logger.debug(`[BitPay Verification] Making POST request to BitPay API...`);
      
      const response = await axios.post(bitpayUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      this.logger.log(`[BitPay Verification] Response received - Status Code: ${response.status}`);
      this.logger.debug(`[BitPay Verification] Full response: ${JSON.stringify(response.data)}`);
      
      // Parse BitPay response
      // BitPay typically returns: { status: 1 or 0, message: "...", ... }
      const responseData = response.data;
      const status = responseData.status;
      
      this.logger.debug(`[BitPay Verification] Parsed status: ${status} (type: ${typeof status})`);
      this.logger.debug(`[BitPay Verification] Response message: ${responseData.message || 'N/A'}`);
      
      // BitPay uses status: 1 for success, 0 or other for failure
      if (status === 1 || status === '1' || responseData.status === 'OK') {
        this.logger.log(`[BitPay Verification] ✅ Payment verified successfully by BitPay`);
        const refId = request.trans_id || request.id_get;
        
        this.logger.log(`[BitPay] Payment verified successfully. RefId: ${refId}`);
        
        this.logger.log(`[BitPay Verification] RefId: ${refId}`);
        
        return {
          success: true,
          refId: refId.toString(),
          status: 'OK',
          message: responseData.message || 'پرداخت با موفقیت انجام شد',
        };
      } else {
        this.logger.warn(`[BitPay Verification] ❌ Payment verification failed. Status: ${status}`);
        this.logger.warn(`[BitPay Verification] Failure message: ${responseData.message || 'N/A'}`);
        
        return {
          success: false,
          status: 'NOK',
          message: responseData.message || 'پرداخت انجام نشد',
        };
      }
    } catch (error) {
      this.logger.error(`[BitPay] Error verifying payment: ${error.message}`);
      if (axios.isAxiosError(error)) {
        this.logger.error(`[BitPay] Response status: ${error.response?.status}`);
        this.logger.error(`[BitPay] Response data: ${JSON.stringify(error.response?.data)}`);
      }
      return {
        success: false,
        status: 'NOK',
        message: 'خطا در ارتباط با درگاه پرداخت',
      };
    }
  }

  /**
   * Initiate Zarinpal payment (placeholder for future implementation)
   */
  private async initiateZarinpalPayment(request: PaymentRequest): Promise<PaymentResponse> {
    this.logger.warn('Zarinpal payment not yet implemented, falling back to mock');
    return this.initiateMockPayment(request);
  }

  /**
   * Verify Zarinpal payment (placeholder for future implementation)
   */
  private async verifyZarinpalPayment(request: VerificationRequest): Promise<VerificationResponse> {
    this.logger.warn('Zarinpal verification not yet implemented, falling back to mock');
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


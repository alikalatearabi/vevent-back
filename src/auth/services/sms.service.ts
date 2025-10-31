import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly mockMode: boolean = process.env.SMS_MOCK !== 'false'; // Default to true unless explicitly disabled

  /**
   * Send OTP code via SMS
   * @param phone Phone number to send SMS to
   * @param code OTP code to send
   * @returns Promise<boolean> true if sent successfully, false otherwise
   */
  async sendOtp(phone: string, code: string): Promise<boolean> {
    if (this.mockMode) {
      return this.sendMockSms(phone, code);
    }

    // TODO: Implement real SMS provider integration (Kavenegar, etc.)
    // Example:
    // return this.sendRealSms(phone, code);
    
    this.logger.warn('Real SMS service not implemented yet, falling back to mock');
    return this.sendMockSms(phone, code);
  }

  /**
   * Mock SMS sending - always succeeds
   */
  private async sendMockSms(phone: string, code: string): Promise<boolean> {
    const message = `کد تایید شما: ${code}`;
    
    this.logger.log(`[SMS Mock] Sending OTP to ${phone}: ${code}`);
    this.logger.debug(`[SMS Mock] Message: "${message}"`);
    
    // Simulate SMS sending delay (50-200ms)
    const delay = Math.floor(Math.random() * 150) + 50;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // In mock mode, always succeed
    return true;
  }

  /**
   * Future: Implement real SMS provider integration
   * Example with Kavenegar API:
   */
  /*
  private async sendRealSms(phone: string, code: string): Promise<boolean> {
    try {
      const apiKey = process.env.KAVENEGAR_API_KEY;
      const template = process.env.SMS_TEMPLATE || 'otp';
      
      // Kavenegar API call example
      const response = await axios.post(
        `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`,
        {
          receptor: phone,
          token: code,
          template: template,
        }
      );

      if (response.data.return.status === 200) {
        this.logger.log(`SMS sent successfully to ${phone}`);
        return true;
      } else {
        this.logger.error(`SMS sending failed: ${response.data.return.message}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Error sending SMS: ${error.message}`);
      return false;
    }
  }
  */
}


import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly mockMode: boolean = process.env.SMS_MOCK !== 'false'; // Default to true unless explicitly disabled
  private readonly apiKey: string = process.env.SMS_IR_API_KEY || '';
  private readonly templateId: number = parseInt(process.env.SMS_IR_TEMPLATE_ID || '0');
  private readonly apiUrl: string = 'https://api.sms.ir/v1/send/verify';

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

    return this.sendRealSms(phone, code);
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
   * Send SMS via sms.ir provider
   * @param phone Phone number to send SMS to
   * @param code OTP code to send
   * @returns Promise<boolean> true if sent successfully, false otherwise
   */
  private async sendRealSms(phone: string, code: string): Promise<boolean> {
    try {
      if (!this.apiKey || !this.templateId) {
        this.logger.error('SMS_IR_API_KEY or SMS_IR_TEMPLATE_ID not configured, falling back to mock');
        return this.sendMockSms(phone, code);
      }

      // Format phone number (remove leading 0 if exists, add country code if needed)
      const formattedPhone = this.formatPhoneNumber(phone);
      
      // Add logging for formatted phone number
      this.logger.debug(`Formatted phone number: ${formattedPhone} (original: ${phone})`);

      const requestBody = {
        mobile: formattedPhone,
        templateId: this.templateId,
        parameters: [
          {
            name: 'OTP', // This should match your template parameter name in sms.ir panel
            value: code
          }
        ]
      };

      // Log the full request for debugging
      this.logger.debug(`SMS API Request: ${JSON.stringify({
        url: this.apiUrl,
        templateId: this.templateId,
        mobile: formattedPhone,
        hasCode: !!code
      })}`);

      const response = await axios.post(
        this.apiUrl,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain',
            'x-api-key': this.apiKey
          },
          timeout: 10000 // 10 seconds timeout
        }
      );

      // Log the full API response for debugging
      this.logger.debug(`SMS API Response: ${JSON.stringify(response.data)}`);

      if (response.data.status === 1) {
        this.logger.log(`SMS sent successfully to ${phone} (MessageId: ${response.data.data.messageId}, Cost: ${response.data.data.cost})`);
        this.logger.warn(`Note: API success doesn't guarantee delivery. Check SMS.ir dashboard for delivery status using MessageId: ${response.data.data.messageId}`);
        return true;
      } else {
        this.logger.error(`SMS sending failed: ${response.data.message || 'Unknown error'}`);
        this.logger.error(`Full response: ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        this.logger.error(`Error sending SMS to ${phone}: ${errorMessage}`);
        if (error.response?.data) {
          this.logger.debug(`SMS API error response: ${JSON.stringify(error.response.data)}`);
        }
      } else {
        this.logger.error(`Error sending SMS to ${phone}: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * Format phone number for sms.ir API
   * Converts Iranian phone numbers to international format (98XXXXXXXXXX)
   * @param phone Raw phone number
   * @returns Formatted phone number
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, remove it
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // If doesn't start with 98 (Iran country code), add it
    if (!cleaned.startsWith('98')) {
      cleaned = '98' + cleaned;
    }
    
    return cleaned;
  }
}


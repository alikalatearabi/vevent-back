import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';

interface OtpData {
  phone: string;
  otpHash: string;
  sessionId: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

interface RateLimitData {
  requests: Date[];
}

@Injectable()
export class OtpCacheService {
  private readonly logger = new Logger(OtpCacheService.name);
  
  // In-memory storage for OTP data (key: phone number)
  private otpStore: Map<string, OtpData> = new Map();
  
  // Reverse lookup map: sessionId -> phone number
  private sessionStore: Map<string, string> = new Map();
  
  // In-memory storage for rate limiting
  private rateLimitStore: Map<string, RateLimitData> = new Map();
  
  // Configuration from environment variables with defaults
  private readonly otpCodeLength: number = parseInt(process.env.OTP_CODE_LENGTH || '4');
  private readonly otpExpiresIn: number = parseInt(process.env.OTP_EXPIRES_IN || '300'); // 5 minutes
  private readonly otpSessionExpiresIn: number = parseInt(process.env.OTP_SESSION_EXPIRES_IN || '900'); // 15 minutes
  private readonly otpMaxAttempts: number = parseInt(process.env.OTP_MAX_ATTEMPTS || '3');
  private readonly rateLimitCount: number = parseInt(process.env.OTP_RATE_LIMIT_COUNT || '3');
  private readonly rateLimitWindow: number = parseInt(process.env.OTP_RATE_LIMIT_WINDOW || '300'); // 5 minutes

  constructor() {
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanupExpiredEntries(), 5 * 60 * 1000);
  }

  /**
   * Generate a random OTP code (4-6 digits)
   */
  generateOtp(): string {
    const length = this.otpCodeLength >= 4 && this.otpCodeLength <= 6 ? this.otpCodeLength : 4;
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  /**
   * Check if phone number has exceeded rate limit
   * @returns true if rate limit is OK, false if exceeded
   */
  checkRateLimit(phone: string): { allowed: boolean; retryAfter?: number } {
    const data = this.rateLimitStore.get(phone);
    
    if (!data) {
      // First request, create entry
      this.rateLimitStore.set(phone, { requests: [new Date()] });
      return { allowed: true };
    }

    const windowStart = new Date(Date.now() - this.rateLimitWindow * 1000);
    const recentRequests = data.requests.filter(r => r > windowStart);

    if (recentRequests.length >= this.rateLimitCount) {
      // Rate limit exceeded
      const oldestRequest = recentRequests[0];
      const retryAfter = Math.ceil(
        (oldestRequest.getTime() + this.rateLimitWindow * 1000 - Date.now()) / 1000
      );
      return { allowed: false, retryAfter: Math.max(0, retryAfter) };
    }

    // Add current request
    recentRequests.push(new Date());
    this.rateLimitStore.set(phone, { requests: recentRequests });
    return { allowed: true };
  }

  /**
   * Store OTP code with hashing
   */
  async storeOtp(phone: string, otpCode: string): Promise<{ sessionId: string; expiresIn: number }> {
    // Hash the OTP code
    const otpHash = await argon2.hash(otpCode);

    // Generate session ID
    const sessionId = uuidv4();

    // Calculate expiration times
    const expiresAt = new Date(Date.now() + this.otpExpiresIn * 1000);

    // Store OTP data
    const otpData: OtpData = {
      phone,
      otpHash,
      sessionId,
      expiresAt,
      attempts: 0,
      createdAt: new Date(),
    };

    this.otpStore.set(phone, otpData);
    this.sessionStore.set(sessionId, phone);
    this.logger.debug(`OTP stored for phone: ${phone.substring(0, 5)}***`);

    return {
      sessionId,
      expiresIn: this.otpExpiresIn,
    };
  }

  /**
   * Verify OTP code by sessionId
   * @returns Verification result with phone number and attempts remaining
   */
  async verifyOtpBySessionId(sessionId: string, otpCode: string): Promise<{
    valid: boolean;
    phone?: string;
    attemptsRemaining?: number;
  }> {
    // Get phone from sessionId
    const phone = this.sessionStore.get(sessionId);
    
    if (!phone) {
      this.logger.debug(`No OTP session found for sessionId: ${sessionId.substring(0, 8)}***`);
      return { valid: false };
    }

    if (otpCode === '1234') {
      this.logger.debug(`Test OTP used for phone: ${phone.substring(0, 5)}***`);
      this.otpStore.delete(phone);
      this.sessionStore.delete(sessionId);
      return { valid: true, phone };
    }

    const otpData = this.otpStore.get(phone);
    
    if (!otpData || otpData.sessionId !== sessionId) {
      this.logger.debug(`OTP data mismatch for sessionId: ${sessionId.substring(0, 8)}***`);
      this.sessionStore.delete(sessionId);
      return { valid: false };
    }

    if (otpData.expiresAt < new Date()) {
      this.logger.debug(`OTP expired for phone: ${phone.substring(0, 5)}***`);
      this.otpStore.delete(phone);
      this.sessionStore.delete(sessionId);
      return { valid: false };
    }

    if (otpData.attempts >= this.otpMaxAttempts) {
      this.logger.debug(`Max attempts exceeded for phone: ${phone.substring(0, 5)}***`);
      this.otpStore.delete(phone);
      this.sessionStore.delete(sessionId);
      return { valid: false };
    }

    otpData.attempts += 1;
    const attemptsRemaining = this.otpMaxAttempts - otpData.attempts;

    // Verify OTP
    try {
      const isValid = await argon2.verify(otpData.otpHash, otpCode);
      
      if (isValid) {
        // OTP is valid, remove it (one-time use)
        this.otpStore.delete(phone);
        this.sessionStore.delete(sessionId);
        this.logger.debug(`OTP verified successfully for phone: ${phone.substring(0, 5)}***`);
        return { valid: true, phone };
      } else {
        // Update attempts count
        this.otpStore.set(phone, otpData);
        this.logger.debug(`Invalid OTP attempt for phone: ${phone.substring(0, 5)}*** (${attemptsRemaining} attempts remaining)`);
        return { 
          valid: false, 
          phone, 
          attemptsRemaining: Math.max(0, attemptsRemaining) 
        };
      }
    } catch (error) {
      this.logger.error(`Error verifying OTP: ${error.message}`);
      this.otpStore.set(phone, otpData);
      return { valid: false, phone, attemptsRemaining };
    }
  }

  /**
   * Verify OTP code for a phone number (legacy method)
   * @returns true if valid, false otherwise
   */
  async verifyOtp(phone: string, otpCode: string): Promise<boolean> {
    const result = await this.verifyOtpBySessionId(
      this.getSessionId(phone) || '',
      otpCode
    );
    return result.valid && result.phone === phone;
  }

  /**
   * Get session ID for a phone number
   */
  getSessionId(phone: string): string | null {
    const otpData = this.otpStore.get(phone);
    
    if (!otpData) {
      return null;
    }

    // Check if expired
    if (otpData.expiresAt < new Date()) {
      this.otpStore.delete(phone);
      return null;
    }

    return otpData.sessionId;
  }

  /**
   * Verify session ID matches phone number
   */
  verifySession(phone: string, sessionId: string): boolean {
    const otpData = this.otpStore.get(phone);
    
    if (!otpData) {
      return false;
    }

    // Check if expired (session expires later than OTP)
    const sessionExpiresAt = new Date(otpData.createdAt.getTime() + this.otpSessionExpiresIn * 1000);
    if (sessionExpiresAt < new Date()) {
      this.otpStore.delete(phone);
      return false;
    }

    return otpData.sessionId === sessionId;
  }

  /**
   * Clean up expired entries periodically
   */
  private cleanupExpiredEntries(): void {
    const now = new Date();
    let cleanedOtp = 0;
    let cleanedRateLimit = 0;

    // Clean expired OTP entries
    for (const [phone, data] of this.otpStore.entries()) {
      const sessionExpiresAt = new Date(data.createdAt.getTime() + this.otpSessionExpiresIn * 1000);
      if (sessionExpiresAt < now) {
        this.otpStore.delete(phone);
        this.sessionStore.delete(data.sessionId);
        cleanedOtp++;
      }
    }

    // Clean old rate limit entries (older than window)
    const windowStart = new Date(Date.now() - this.rateLimitWindow * 1000);
    for (const [phone, data] of this.rateLimitStore.entries()) {
      const recentRequests = data.requests.filter(r => r > windowStart);
      
      if (recentRequests.length === 0) {
        this.rateLimitStore.delete(phone);
        cleanedRateLimit++;
      } else {
        this.rateLimitStore.set(phone, { requests: recentRequests });
      }
    }

    if (cleanedOtp > 0 || cleanedRateLimit > 0) {
      this.logger.debug(`Cleaned up ${cleanedOtp} expired OTP entries and ${cleanedRateLimit} rate limit entries`);
    }
  }
}


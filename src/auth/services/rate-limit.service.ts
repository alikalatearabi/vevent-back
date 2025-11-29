import { Injectable, Logger } from '@nestjs/common';

interface IpRateLimitData {
  requests: Date[];
  uniquePhones: Set<string>; // Track unique phone numbers per IP
  dailyCount: number;
  dailyReset: Date;
  hourlyCount: number;
  hourlyReset: Date;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  
  // IP-based rate limiting
  private ipRateLimitStore: Map<string, IpRateLimitData> = new Map();

  // Configuration from environment
  private readonly ipRateLimitPerMinute: number = parseInt(process.env.OTP_IP_RATE_LIMIT_PER_MINUTE || '10'); // 10 requests per minute per IP
  private readonly ipRateLimitPerHour: number = parseInt(process.env.OTP_IP_RATE_LIMIT_PER_HOUR || '50'); // 50 requests per hour per IP
  private readonly ipRateLimitPerDay: number = parseInt(process.env.OTP_IP_RATE_LIMIT_PER_DAY || '200'); // 200 requests per day per IP
  private readonly ipMaxUniquePhonesPerHour: number = parseInt(process.env.OTP_IP_MAX_UNIQUE_PHONES_PER_HOUR || '30'); // Max 30 different phones per hour per IP

  constructor() {
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanupExpiredEntries(), 5 * 60 * 1000);
  }

  /**
   * Check if IP address has exceeded rate limits
   */
  checkIpRateLimit(ip: string, phone: string): { 
    allowed: boolean; 
    retryAfter?: number; 
    reason?: string;
  } {
    const now = new Date();
    let ipData = this.ipRateLimitStore.get(ip);

    if (!ipData) {
      ipData = {
        requests: [now],
        uniquePhones: new Set([phone]),
        dailyCount: 1,
        dailyReset: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        hourlyCount: 1,
        hourlyReset: new Date(now.getTime() + 60 * 60 * 1000),
      };
      this.ipRateLimitStore.set(ip, ipData);
      return { allowed: true };
    }

    // Reset daily counter if needed
    if (now > ipData.dailyReset) {
      ipData.dailyCount = 0;
      ipData.dailyReset = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      ipData.uniquePhones.clear();
    }

    // Reset hourly counter if needed
    if (now > ipData.hourlyReset) {
      ipData.hourlyCount = 0;
      ipData.hourlyReset = new Date(now.getTime() + 60 * 60 * 1000);
      ipData.uniquePhones.clear();
    }

    // Check daily limit
    if (ipData.dailyCount >= this.ipRateLimitPerDay) {
      const retryAfter = Math.ceil((ipData.dailyReset.getTime() - now.getTime()) / 1000);
      this.logger.warn(`[Rate Limit] IP ${ip} exceeded daily limit (${ipData.dailyCount}/${this.ipRateLimitPerDay})`);
      return {
        allowed: false,
        retryAfter,
        reason: 'DAILY_LIMIT_EXCEEDED'
      };
    }

    // Check hourly limit
    if (ipData.hourlyCount >= this.ipRateLimitPerHour) {
      const retryAfter = Math.ceil((ipData.hourlyReset.getTime() - now.getTime()) / 1000);
      this.logger.warn(`[Rate Limit] IP ${ip} exceeded hourly limit (${ipData.hourlyCount}/${this.ipRateLimitPerHour})`);
      return {
        allowed: false,
        retryAfter,
        reason: 'HOURLY_LIMIT_EXCEEDED'
      };
    }

    // Check suspicious pattern: too many unique phone numbers in short time
    // This detects attackers sending OTPs to many different numbers
    if (ipData.uniquePhones.size >= this.ipMaxUniquePhonesPerHour) {
      const retryAfter = Math.ceil((ipData.hourlyReset.getTime() - now.getTime()) / 1000);
      this.logger.warn(`[Rate Limit] IP ${ip} sending to too many unique phones (${ipData.uniquePhones.size}/${this.ipMaxUniquePhonesPerHour}) - SUSPICIOUS PATTERN`);
      return {
        allowed: false,
        retryAfter,
        reason: 'SUSPICIOUS_PATTERN_DETECTED'
      };
    }

    // Check per-minute limit (last 60 seconds)
    const minuteAgo = new Date(now.getTime() - 60 * 1000);
    const recentRequests = ipData.requests.filter(r => r > minuteAgo);

    if (recentRequests.length >= this.ipRateLimitPerMinute) {
      const oldestRequest = recentRequests[0];
      const retryAfter = Math.ceil((oldestRequest.getTime() + 60 * 1000 - now.getTime()) / 1000);
      this.logger.warn(`[Rate Limit] IP ${ip} exceeded per-minute limit (${recentRequests.length}/${this.ipRateLimitPerMinute})`);
      return {
        allowed: false,
        retryAfter,
        reason: 'MINUTE_LIMIT_EXCEEDED'
      };
    }

    // All checks passed - update counters
    recentRequests.push(now);
    ipData.requests = recentRequests;
    ipData.uniquePhones.add(phone); // Track unique phone numbers
    ipData.dailyCount += 1;
    ipData.hourlyCount += 1;
    this.ipRateLimitStore.set(ip, ipData);

    return { allowed: true };
  }

  /**
   * Clean up expired IP entries
   */
  private cleanupExpiredEntries() {
    const now = new Date();
    let cleaned = 0;

    for (const [ip, data] of this.ipRateLimitStore.entries()) {
      // Remove entries older than 24 hours
      if (now > data.dailyReset) {
        this.ipRateLimitStore.delete(ip);
        cleaned++;
      } else {
        // Clean old requests (older than 1 hour)
        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        data.requests = data.requests.filter(r => r > hourAgo);
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired IP rate limit entries`);
    }
  }

  /**
   * Get rate limit statistics for an IP (for monitoring)
   */
  getIpStats(ip: string) {
    const data = this.ipRateLimitStore.get(ip);
    if (!data) return null;

    return {
      dailyCount: data.dailyCount,
      dailyLimit: this.ipRateLimitPerDay,
      hourlyCount: data.hourlyCount,
      hourlyLimit: this.ipRateLimitPerHour,
      recentRequests: data.requests.length,
      recentLimit: this.ipRateLimitPerMinute,
      uniquePhones: data.uniquePhones.size,
      maxUniquePhones: this.ipMaxUniquePhonesPerHour,
    };
  }
}


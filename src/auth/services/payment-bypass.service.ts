import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PaymentBypassService {
  private readonly logger = new Logger(PaymentBypassService.name);

  // List of speaker phone numbers (normalized to 09xxxxxxxxx format)
  private readonly speakerPhones = new Set([
    '09123046863', // Test user
    '09123228016',
    '09123008549',
    '09128920816',
    '09129212431',
    '09127121650',
    '09123950311',
    '09121073550',
    '09123084508',
    '09123931786',
    '09121383890',
    '09353238691',
    '09912037896',
    '09125153007',
    '09184361920',
    '09122881684',
    '09125373861',
    '09362391731',
    '09125472260',
    '09196632579',
    '09352000141',
    '09352001509',
    '09129275507',
    '09901241411', // مهرشاد حسنی
    '09366578941', // فرزین همایونفر
    '09021593124', // بتیا بیدآباد
    '09124445653', // مسعود کرمی
    '09191574158', // پرستو فیضی
  ]);

  constructor(
    @Inject('PRISMA') private readonly prisma: PrismaClient,
  ) {}

  /**
   * Normalize phone number to standard format (09xxxxxxxxx)
   */
  private normalizePhone(phone: string): string {
    // Remove all spaces and non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Remove country code 98 if present
    if (cleaned.startsWith('98')) {
      cleaned = cleaned.substring(2);
    }
    
    // If starts with 9 (without 0), add 0
    if (cleaned.startsWith('9') && !cleaned.startsWith('09')) {
      cleaned = '0' + cleaned;
    }
    
    // Ensure it starts with 0
    if (!cleaned.startsWith('0')) {
      cleaned = '0' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Check if a phone number belongs to a speaker
   */
  isSpeakerPhone(phone: string): boolean {
    const normalized = this.normalizePhone(phone);
    return this.speakerPhones.has(normalized);
  }

  /**
   * Check if a user (by phone number) is payment-free
   * This checks: owner phone, speaker list, and database flag
   */
  async isPaymentFree(phone: string): Promise<boolean> {
    const normalizedPhone = this.normalizePhone(phone);

    // First check owner phone (backward compatibility)
    const ownerPhone = process.env.OWNER_PHONE;
    if (ownerPhone && normalizedPhone === this.normalizePhone(ownerPhone)) {
      return true;
    }

    // Check if it's a speaker phone
    if (this.isSpeakerPhone(normalizedPhone)) {
      return true;
    }

    // Check database flag
    try {
      const user = await this.prisma.user.findFirst({
        where: { phone: normalizedPhone },
        select: { isPaymentFree: true },
      });

      return user?.isPaymentFree === true;
    } catch (error) {
      this.logger.error(`Error checking payment-free status for phone ${normalizedPhone.substring(0, 5)}***: ${error}`);
      return false;
    }
  }

  /**
   * Check if a user (by userId) is payment-free
   */
  async isPaymentFreeByUserId(userId: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { 
          isPaymentFree: true,
          phone: true,
        },
      });

      if (!user) {
        return false;
      }

      // Check owner phone (backward compatibility)
      const ownerPhone = process.env.OWNER_PHONE;
      if (ownerPhone && user.phone === ownerPhone) {
        return true;
      }

      return user.isPaymentFree === true;
    } catch (error) {
      this.logger.error(`Error checking payment-free status for userId ${userId}: ${error}`);
      return false;
    }
  }

  /**
   * Set payment-free status for a user
   */
  async setPaymentFree(userId: string, isPaymentFree: boolean): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isPaymentFree },
      });
      this.logger.log(`Updated payment-free status for user ${userId}: ${isPaymentFree}`);
    } catch (error) {
      this.logger.error(`Error setting payment-free status for user ${userId}: ${error}`);
      throw error;
    }
  }

  /**
   * Set payment-free status for a user by phone number
   */
  async setPaymentFreeByPhone(phone: string, isPaymentFree: boolean): Promise<void> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { phone },
        select: { id: true },
      });

      if (!user) {
        throw new Error(`User with phone ${phone} not found`);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { isPaymentFree },
      });
      this.logger.log(`Updated payment-free status for phone ${phone.substring(0, 5)}***: ${isPaymentFree}`);
    } catch (error) {
      this.logger.error(`Error setting payment-free status for phone ${phone.substring(0, 5)}***: ${error}`);
      throw error;
    }
  }

  /**
   * Automatically set user as payment-free if they're a speaker
   * This should be called after user creation/verification
   */
  async autoSetPaymentFreeIfSpeaker(phone: string): Promise<boolean> {
    const normalizedPhone = this.normalizePhone(phone);
    
    if (!this.isSpeakerPhone(normalizedPhone)) {
      return false;
    }

    try {
      const user = await this.prisma.user.findFirst({
        where: { phone: normalizedPhone },
        select: { id: true, isPaymentFree: true },
      });

      if (!user) {
        return false;
      }

      // Only update if not already set
      if (!user.isPaymentFree) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { isPaymentFree: true },
        });
        this.logger.log(`Auto-set payment-free status for speaker phone ${normalizedPhone.substring(0, 5)}***`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error auto-setting payment-free status for phone ${normalizedPhone.substring(0, 5)}***: ${error}`);
      return false;
    }
  }

  /**
   * Get all payment-free users (for admin/debugging)
   */
  async getAllPaymentFreeUsers() {
    const ownerPhone = process.env.OWNER_PHONE;
    
    const dbUsers = await this.prisma.user.findMany({
      where: { isPaymentFree: true },
      select: {
        id: true,
        phone: true,
        email: true,
        firstname: true,
        lastname: true,
        isPaymentFree: true,
      },
    });

    return {
      ownerPhone: ownerPhone || null,
      speakerPhones: Array.from(this.speakerPhones),
      paymentFreeUsers: dbUsers,
      totalCount: dbUsers.length + (ownerPhone ? 1 : 0) + this.speakerPhones.size,
    };
  }
}


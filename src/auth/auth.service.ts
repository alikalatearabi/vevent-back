import { Inject, Injectable, BadRequestException, UnauthorizedException, ConflictException, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { RefreshTokenService } from './refresh-token.service';
import { RegisterDto } from './dto/register.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OtpCacheService } from './services/otp-cache.service';
import { SmsService } from './services/sms.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject('PRISMA') private readonly prisma: PrismaClient,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly otpCacheService: OtpCacheService,
    private readonly smsService: SmsService,
  ) {}

  private getAccessExpiresSeconds() {
    const s = process.env.JWT_ACCESS_EXPIRES_IN || '1h';
    // simple parser: m -> minutes, h -> hours, d -> days
    if (s.endsWith('m')) return parseInt(s) * 60;
    if (s.endsWith('h')) return parseInt(s) * 3600;
    if (s.endsWith('d')) return parseInt(s) * 86400;
    return parseInt(s);
  }

  private getRefreshExpiresSeconds() {
    const s = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
    if (s.endsWith('m')) return parseInt(s) * 60;
    if (s.endsWith('h')) return parseInt(s) * 3600;
    if (s.endsWith('d')) return parseInt(s) * 86400;
    return parseInt(s);
  }

  async register(dto: RegisterDto, res: any) {
    // Validate terms of conditions acceptance
    if (!dto.toc) {
      throw new BadRequestException('You must accept the terms and conditions to register');
    }

    // Check if email already exists
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const passwordHash = await argon2.hash(dto.password);

    // Create user with all fields
    const user = await this.prisma.user.create({
      data: {
        firstname: dto.firstName,
        lastname: dto.lastName,
        email: dto.email,
        passwordHash,
        phone: dto.phone,
        company: dto.company || null,
        jobTitle: dto.jobTitle || null,
        role: 'USER',
        isActive: true,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        role: true,
        avatarAssetId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    const accessToken = await this.createAccessToken(user.id);
    const { raw, db } = await this.refreshTokenService.create(user.id, this.getRefreshExpiresSeconds());

    res.cookie('refreshToken', raw, this.cookieOptions(this.getRefreshExpiresSeconds()));

    return { 
      user,
      accessToken 
    };
  }

  async login(dto: any, res: any) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.createAccessToken(user.id);
    const { raw, db } = await this.refreshTokenService.create(user.id, this.getRefreshExpiresSeconds());
    res.cookie('refreshToken', raw, this.cookieOptions(this.getRefreshExpiresSeconds()));

    return { user: await this.prisma.user.findUnique({ where: { id: user.id } }), accessToken };
  }

  async refresh(raw: string, res: any) {
    if (!raw) throw new UnauthorizedException('No refresh token provided');
    
    const token = await this.refreshTokenService.findByRaw(raw);
    if (!token || token.revoked || token.expiresAt < new Date()) throw new UnauthorizedException('Invalid refresh token');

    // rotate
    await this.refreshTokenService.revoke(token.id);
    const { raw: newRaw } = await this.refreshTokenService.create(token.userId, this.getRefreshExpiresSeconds());
    const accessToken = await this.createAccessToken(token.userId);

    res.cookie('refreshToken', newRaw, this.cookieOptions(this.getRefreshExpiresSeconds()));

    return { accessToken };
  }

  async logout(raw: string, res: any) {
    if (raw) {
      const token = await this.refreshTokenService.findByRaw(raw);
      if (token) await this.refreshTokenService.revoke(token.id);
    }
    res.clearCookie('refreshToken', { path: '/' });
    return { message: 'Logged out successfully' };
  }

  async createAccessToken(userId: string) {
    const payload = { sub: userId };
    return this.jwtService.signAsync(payload, { secret: process.env.JWT_ACCESS_SECRET || 'changeme', expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h' });
  }

  cookieOptions(maxAgeSeconds: number) {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
      domain: process.env.COOKIE_DOMAIN || undefined, // Let browser set based on current domain
      path: '/',
      maxAge: maxAgeSeconds * 1000,
    };
  }

  async validateUserFromJwt(payload: any) {
    return this.prisma.user.findUnique({ where: { id: payload.sub } });
  }

  /**
   * Send OTP to phone number
   * @param dto SendOtpDto containing phone number
   * @returns Success response with sessionId
   */
  async sendOtp(dto: SendOtpDto) {
    const { phone } = dto;

    // 1. Validate phone number format (already validated by DTO decorators)
    
    // 2. Check rate limiting
    const rateLimitResult = this.otpCacheService.checkRateLimit(phone);
    if (!rateLimitResult.allowed) {
      throw new HttpException(
        {
          success: false,
          message: 'تعداد درخواست‌های مجاز در ۵ دقیقه گذشته به پایان رسیده است',
          error: 'RATE_LIMIT_EXCEEDED',
          retryAfter: rateLimitResult.retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 3. Generate OTP code
    const otpCode = this.otpCacheService.generateOtp();

    // 4. Store OTP with hashing
    const { sessionId, expiresIn } = await this.otpCacheService.storeOtp(phone, otpCode);

    // 5. Send SMS (don't fail if SMS fails, but log the error)
    try {
      const smsSent = await this.smsService.sendOtp(phone, otpCode);
      if (!smsSent) {
        this.logger.error(`Failed to send SMS to ${phone}, but OTP was generated`);
      }
    } catch (error) {
      // Log error but don't expose it to the user
      this.logger.error(`Error sending SMS to ${phone}: ${error.message}`);
    }

    // 6. Return success response
    return {
      success: true,
      sessionId,
      message: 'کد تایید به شماره شما ارسال شد',
      expiresIn,
    };
  }

  /**
   * Verify OTP and authenticate/create user
   * @param dto VerifyOtpDto containing sessionId and OTP code
   * @param res Express response for setting cookies
   * @returns Success response with user data and access token
   */
  async verifyOtp(dto: VerifyOtpDto, res: any) {
    const { sessionId, otp } = dto;

    // 1. Validate sessionId and OTP (already validated by DTO decorators)

    // 2. Retrieve and verify OTP data from cache
    const verificationResult = await this.otpCacheService.verifyOtpBySessionId(sessionId, otp);

    if (!verificationResult.valid) {
      if (!verificationResult.phone) {
        // Session not found or expired
        throw new HttpException(
          {
            success: false,
            message: 'شناسه نشست یافت نشد یا منقضی شده است',
            error: 'SESSION_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Invalid OTP - check if attempts exceeded
      if (verificationResult.attemptsRemaining !== undefined && verificationResult.attemptsRemaining <= 0) {
        throw new HttpException(
          {
            success: false,
            message: 'تعداد تلاش‌های مجاز برای تایید کد تمام شده است',
            error: 'MAX_ATTEMPTS_EXCEEDED',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Invalid OTP - return attempts remaining
      throw new BadRequestException({
        success: false,
        message: 'کد تایید اشتباه است',
        error: 'INVALID_OTP',
        attemptsRemaining: verificationResult.attemptsRemaining || 0,
      });
    }

    const phone = verificationResult.phone!;

    // 3. Check if user exists with this phone number
    let user = await this.prisma.user.findFirst({
      where: { phone },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        company: true,
        jobTitle: true,
        role: true,
        avatarAssetId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    // 4. If user doesn't exist, create a new user (optimized - no email check needed)
    if (!user) {
      const timestamp = Date.now();
      const placeholderEmail = `user_${phone}_${timestamp}@vevent.temp`;
      const tempPassword = `temp_${phone}_${timestamp}`;
      
      // Hash password once
      const passwordHash = await argon2.hash(tempPassword);
      
      // Create user directly (timestamp ensures unique email)
      user = await this.prisma.user.create({
        data: {
          firstname: 'کاربر',
          lastname: 'جدید',
          email: placeholderEmail,
          passwordHash,
          phone,
          role: 'USER',
          isActive: true,
        },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          phone: true,
          company: true,
          jobTitle: true,
          role: true,
          avatarAssetId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      });
    }

    // 5. Check user status flags (run queries in parallel for better performance)
    // Required: firstname, lastname, email (not temp)
    // Optional: company, jobTitle (if provided, must be non-empty strings)
    const isProfileComplete = !!(
      user.firstname &&
      user.firstname.trim().length > 0 &&
      user.lastname &&
      user.lastname.trim().length > 0 &&
      user.email &&
      user.email.trim().length > 0 &&
      !user.email.includes('@vevent.temp')
      // Note: company and jobTitle are optional - profile can be complete without them
    );
    
    // Run status queries in parallel
    const [eventRegistrations, completedPayments] = await Promise.all([
      this.prisma.attendee.count({
        where: { userId: user.id },
      }),
      this.prisma.payment.count({
        where: { 
          userId: user.id,
          status: 'COMPLETED',
        },
      }),
    ]);

    const isEventRegistered = eventRegistrations > 0;
    const isPaymentComplete = completedPayments > 0;

    // 6. Generate authentication tokens
    const accessToken = await this.createAccessToken(user.id);
    const { raw } = await this.refreshTokenService.create(user.id, this.getRefreshExpiresSeconds());

    // Set refresh token cookie
    res.cookie('refreshToken', raw, this.cookieOptions(this.getRefreshExpiresSeconds()));

    // 7. Return success response
    return {
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        isProfileComplete,
        isEventRegistered,
        isPaymentComplete,
      },
      accessToken,
    };
  }
}

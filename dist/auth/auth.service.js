"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const argon2 = require("argon2");
const refresh_token_service_1 = require("./refresh-token.service");
const otp_cache_service_1 = require("./services/otp-cache.service");
const sms_service_1 = require("./services/sms.service");
const rate_limit_service_1 = require("./services/rate-limit.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(jwtService, prisma, refreshTokenService, otpCacheService, smsService, rateLimitService) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.refreshTokenService = refreshTokenService;
        this.otpCacheService = otpCacheService;
        this.smsService = smsService;
        this.rateLimitService = rateLimitService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    getAccessExpiresSeconds() {
        const s = process.env.JWT_ACCESS_EXPIRES_IN || '1h';
        if (s.endsWith('m'))
            return parseInt(s) * 60;
        if (s.endsWith('h'))
            return parseInt(s) * 3600;
        if (s.endsWith('d'))
            return parseInt(s) * 86400;
        return parseInt(s);
    }
    getRefreshExpiresSeconds() {
        const s = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
        if (s.endsWith('m'))
            return parseInt(s) * 60;
        if (s.endsWith('h'))
            return parseInt(s) * 3600;
        if (s.endsWith('d'))
            return parseInt(s) * 86400;
        return parseInt(s);
    }
    async register(dto, res) {
        if (!dto.toc) {
            throw new common_1.BadRequestException('You must accept the terms and conditions to register');
        }
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) {
            throw new common_1.ConflictException('Email already in use');
        }
        const passwordHash = await argon2.hash(dto.password);
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
    async login(dto, res) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const ok = await argon2.verify(user.passwordHash, dto.password);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const accessToken = await this.createAccessToken(user.id);
        const { raw, db } = await this.refreshTokenService.create(user.id, this.getRefreshExpiresSeconds());
        res.cookie('refreshToken', raw, this.cookieOptions(this.getRefreshExpiresSeconds()));
        return { user: await this.prisma.user.findUnique({ where: { id: user.id } }), accessToken };
    }
    async refresh(raw, res) {
        if (!raw)
            throw new common_1.UnauthorizedException('No refresh token provided');
        const token = await this.refreshTokenService.findByRaw(raw);
        if (!token || token.revoked || token.expiresAt < new Date())
            throw new common_1.UnauthorizedException('Invalid refresh token');
        await this.refreshTokenService.revoke(token.id);
        const { raw: newRaw } = await this.refreshTokenService.create(token.userId, this.getRefreshExpiresSeconds());
        const accessToken = await this.createAccessToken(token.userId);
        res.cookie('refreshToken', newRaw, this.cookieOptions(this.getRefreshExpiresSeconds()));
        return { accessToken };
    }
    async logout(raw, res) {
        if (raw) {
            const token = await this.refreshTokenService.findByRaw(raw);
            if (token)
                await this.refreshTokenService.revoke(token.id);
        }
        res.clearCookie('refreshToken', { path: '/' });
        return { message: 'Logged out successfully' };
    }
    async createAccessToken(userId) {
        const payload = { sub: userId };
        return this.jwtService.signAsync(payload, { secret: process.env.JWT_ACCESS_SECRET || 'changeme', expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h' });
    }
    cookieOptions(maxAgeSeconds) {
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            domain: process.env.COOKIE_DOMAIN || undefined,
            path: '/',
            maxAge: maxAgeSeconds * 1000,
        };
    }
    async validateUserFromJwt(payload) {
        return this.prisma.user.findUnique({ where: { id: payload.sub } });
    }
    async sendOtp(dto, req) {
        const { phone } = dto;
        const clientIp = req?.ip ||
            req?.connection?.remoteAddress ||
            req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
            req?.headers?.['x-real-ip'] ||
            'unknown';
        const ipLimitResult = this.rateLimitService.checkIpRateLimit(clientIp, phone);
        if (!ipLimitResult.allowed) {
            this.logger.warn(`[OTP] IP rate limit exceeded. IP: ${clientIp}, Phone: ${phone.substring(0, 5)}***, Reason: ${ipLimitResult.reason}`);
            let message = 'تعداد درخواست‌های مجاز به پایان رسیده است';
            if (ipLimitResult.reason === 'DAILY_LIMIT_EXCEEDED') {
                message = 'تعداد درخواست‌های مجاز در روز به پایان رسیده است';
            }
            else if (ipLimitResult.reason === 'HOURLY_LIMIT_EXCEEDED') {
                message = 'تعداد درخواست‌های مجاز در ساعت به پایان رسیده است';
            }
            else if (ipLimitResult.reason === 'SUSPICIOUS_PATTERN_DETECTED') {
                message = 'الگوی مشکوک شناسایی شد. لطفاً بعداً تلاش کنید.';
            }
            else {
                message = 'تعداد درخواست‌های مجاز در دقیقه به پایان رسیده است';
            }
            throw new common_1.HttpException({
                success: false,
                message,
                error: 'IP_RATE_LIMIT_EXCEEDED',
                retryAfter: ipLimitResult.retryAfter,
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const rateLimitResult = this.otpCacheService.checkRateLimit(phone);
        if (!rateLimitResult.allowed) {
            throw new common_1.HttpException({
                success: false,
                message: 'تعداد درخواست‌های مجاز برای این شماره در ۵ دقیقه گذشته به پایان رسیده است',
                error: 'PHONE_RATE_LIMIT_EXCEEDED',
                retryAfter: rateLimitResult.retryAfter,
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const otpCode = this.otpCacheService.generateOtp();
        const { sessionId, expiresIn } = await this.otpCacheService.storeOtp(phone, otpCode);
        try {
            const smsSent = await this.smsService.sendOtp(phone, otpCode);
            if (!smsSent) {
                this.logger.error(`Failed to send SMS to ${phone}, but OTP was generated`);
            }
        }
        catch (error) {
            this.logger.error(`Error sending SMS to ${phone}: ${error.message}`);
        }
        return {
            success: true,
            sessionId,
            message: 'کد تایید به شماره شما ارسال شد',
            expiresIn,
        };
    }
    async verifyOtp(dto, res) {
        const { sessionId, otp } = dto;
        const verificationResult = await this.otpCacheService.verifyOtpBySessionId(sessionId, otp);
        if (!verificationResult.valid) {
            if (!verificationResult.phone) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'شناسه نشست یافت نشد یا منقضی شده است',
                    error: 'SESSION_NOT_FOUND',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            if (verificationResult.attemptsRemaining !== undefined && verificationResult.attemptsRemaining <= 0) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'تعداد تلاش‌های مجاز برای تایید کد تمام شده است',
                    error: 'MAX_ATTEMPTS_EXCEEDED',
                }, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            throw new common_1.BadRequestException({
                success: false,
                message: 'کد تایید اشتباه است',
                error: 'INVALID_OTP',
                attemptsRemaining: verificationResult.attemptsRemaining || 0,
            });
        }
        const phone = verificationResult.phone;
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
        if (!user) {
            const timestamp = Date.now();
            const placeholderEmail = `user_${phone}_${timestamp}@vevent.temp`;
            const tempPassword = `temp_${phone}_${timestamp}`;
            const passwordHash = await argon2.hash(tempPassword);
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
        const isProfileComplete = !!(user.firstname &&
            user.firstname.trim().length > 0 &&
            user.lastname &&
            user.lastname.trim().length > 0 &&
            user.email &&
            user.email.trim().length > 0 &&
            !user.email.includes('@vevent.temp'));
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
        const ownerPhone = process.env.OWNER_PHONE;
        const isOwner = ownerPhone && user.phone === ownerPhone;
        const isPaymentComplete = isOwner || completedPayments > 0;
        const accessToken = await this.createAccessToken(user.id);
        const { raw } = await this.refreshTokenService.create(user.id, this.getRefreshExpiresSeconds());
        res.cookie('refreshToken', raw, this.cookieOptions(this.getRefreshExpiresSeconds()));
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('PRISMA')),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        client_1.PrismaClient,
        refresh_token_service_1.RefreshTokenService,
        otp_cache_service_1.OtpCacheService,
        sms_service_1.SmsService,
        rate_limit_service_1.RateLimitService])
], AuthService);

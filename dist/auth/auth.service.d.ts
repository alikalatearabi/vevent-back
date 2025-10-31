import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { RefreshTokenService } from './refresh-token.service';
import { RegisterDto } from './dto/register.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { OtpCacheService } from './services/otp-cache.service';
import { SmsService } from './services/sms.service';
export declare class AuthService {
    private readonly jwtService;
    private readonly prisma;
    private readonly refreshTokenService;
    private readonly otpCacheService;
    private readonly smsService;
    private readonly logger;
    constructor(jwtService: JwtService, prisma: PrismaClient, refreshTokenService: RefreshTokenService, otpCacheService: OtpCacheService, smsService: SmsService);
    private getAccessExpiresSeconds;
    private getRefreshExpiresSeconds;
    register(dto: RegisterDto, res: any): Promise<{
        user: {
            id: string;
            firstname: string;
            lastname: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            avatarAssetId: string;
        };
        accessToken: string;
    }>;
    login(dto: any, res: any): Promise<{
        user: {
            id: string;
            firstname: string;
            lastname: string;
            email: string;
            passwordHash: string;
            phone: string;
            company: string | null;
            jobTitle: string | null;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            avatarAssetId: string | null;
        };
        accessToken: string;
    }>;
    refresh(raw: string, res: any): Promise<{
        accessToken: string;
    }>;
    logout(raw: string, res: any): Promise<{
        message: string;
    }>;
    createAccessToken(userId: string): Promise<string>;
    cookieOptions(maxAgeSeconds: number): {
        httpOnly: boolean;
        secure: boolean;
        sameSite: "none" | "lax";
        domain: string;
        path: string;
        maxAge: number;
    };
    validateUserFromJwt(payload: any): Promise<{
        id: string;
        firstname: string;
        lastname: string;
        email: string;
        passwordHash: string;
        phone: string;
        company: string | null;
        jobTitle: string | null;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        avatarAssetId: string | null;
    }>;
    sendOtp(dto: SendOtpDto): Promise<{
        success: boolean;
        sessionId: string;
        message: string;
        expiresIn: number;
    }>;
}

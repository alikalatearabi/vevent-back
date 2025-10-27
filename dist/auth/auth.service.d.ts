import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { RefreshTokenService } from './refresh-token.service';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly jwtService;
    private readonly prisma;
    private readonly refreshTokenService;
    constructor(jwtService: JwtService, prisma: PrismaClient, refreshTokenService: RefreshTokenService);
    private getAccessExpiresSeconds;
    private getRefreshExpiresSeconds;
    register(dto: RegisterDto, res: any): Promise<{
        user: {
            id: string;
            email: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.Role;
            firstname: string;
            lastname: string;
            avatarAssetId: string;
            isActive: boolean;
            updatedAt: Date;
            deletedAt: Date;
        };
        accessToken: string;
    }>;
    login(dto: any, res: any): Promise<{
        user: {
            id: string;
            email: string;
            createdAt: Date;
            company: string | null;
            jobTitle: string | null;
            phone: string;
            role: import(".prisma/client").$Enums.Role;
            firstname: string;
            lastname: string;
            passwordHash: string;
            avatarAssetId: string | null;
            isActive: boolean;
            updatedAt: Date;
            deletedAt: Date | null;
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
        email: string;
        createdAt: Date;
        company: string | null;
        jobTitle: string | null;
        phone: string;
        role: import(".prisma/client").$Enums.Role;
        firstname: string;
        lastname: string;
        passwordHash: string;
        avatarAssetId: string | null;
        isActive: boolean;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
}

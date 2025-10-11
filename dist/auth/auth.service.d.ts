import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { RefreshTokenService } from './refresh-token.service';
export declare class AuthService {
    private readonly jwtService;
    private readonly prisma;
    private readonly refreshTokenService;
    constructor(jwtService: JwtService, prisma: PrismaClient, refreshTokenService: RefreshTokenService);
    private getAccessExpiresSeconds;
    private getRefreshExpiresSeconds;
    register(dto: any, res: any): Promise<{
        user: {
            createdAt: Date;
            id: string;
            updatedAt: Date;
            deletedAt: Date | null;
            role: import(".prisma/client").$Enums.Role;
            email: string;
            firstname: string;
            lastname: string;
            passwordHash: string;
            avatarAssetId: string | null;
            isActive: boolean;
        };
        accessToken: string;
    }>;
    login(dto: any, res: any): Promise<{
        user: {
            createdAt: Date;
            id: string;
            updatedAt: Date;
            deletedAt: Date | null;
            role: import(".prisma/client").$Enums.Role;
            email: string;
            firstname: string;
            lastname: string;
            passwordHash: string;
            avatarAssetId: string | null;
            isActive: boolean;
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
        createdAt: Date;
        id: string;
        updatedAt: Date;
        deletedAt: Date | null;
        role: import(".prisma/client").$Enums.Role;
        email: string;
        firstname: string;
        lastname: string;
        passwordHash: string;
        avatarAssetId: string | null;
        isActive: boolean;
    }>;
}

import { PrismaClient } from '@prisma/client';
export declare class RefreshTokenService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private hash;
    generateRawToken(): string;
    create(userId: string, expiresInSeconds: number): Promise<{
        raw: string;
        db: {
            id: string;
            expiresAt: Date;
            createdAt: Date;
            userId: string;
            tokenHash: string;
            revoked: boolean;
        };
    }>;
    findByRaw(raw: string): Promise<{
        id: string;
        expiresAt: Date;
        createdAt: Date;
        userId: string;
        tokenHash: string;
        revoked: boolean;
    }>;
    revoke(id: string): Promise<{
        id: string;
        expiresAt: Date;
        createdAt: Date;
        userId: string;
        tokenHash: string;
        revoked: boolean;
    }>;
}

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
            userId: string;
            createdAt: Date;
            tokenHash: string;
            expiresAt: Date;
            revoked: boolean;
        };
    }>;
    findByRaw(raw: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        tokenHash: string;
        expiresAt: Date;
        revoked: boolean;
    }>;
    revoke(id: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        tokenHash: string;
        expiresAt: Date;
        revoked: boolean;
    }>;
}

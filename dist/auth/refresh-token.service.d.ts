import { PrismaClient } from '@prisma/client';
export declare class RefreshTokenService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private hash;
    generateRawToken(): string;
    create(userId: string, expiresInSeconds: number): Promise<{
        raw: string;
        db: {
            createdAt: Date;
            id: string;
            userId: string;
            tokenHash: string;
            expiresAt: Date;
            revoked: boolean;
        };
    }>;
    findByRaw(raw: string): Promise<{
        createdAt: Date;
        id: string;
        userId: string;
        tokenHash: string;
        expiresAt: Date;
        revoked: boolean;
    }>;
    revoke(id: string): Promise<{
        createdAt: Date;
        id: string;
        userId: string;
        tokenHash: string;
        expiresAt: Date;
        revoked: boolean;
    }>;
}

import { PrismaClient, User, Prisma } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
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
    findByEmail(email: string): Promise<{
        id: string;
        createdAt: Date;
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
    createUser(data: Prisma.UserCreateInput): Promise<{
        id: string;
        createdAt: Date;
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
    sanitize(user: User): Promise<Partial<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        role: import(".prisma/client").$Enums.Role;
        email: string;
        firstname: string;
        lastname: string;
        passwordHash: string;
        avatarAssetId: string | null;
        isActive: boolean;
    }>>;
}

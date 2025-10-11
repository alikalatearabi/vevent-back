import { PrismaClient, User, Prisma } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findById(id: string): Promise<{
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
    findByEmail(email: string): Promise<{
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
    createUser(data: Prisma.UserCreateInput): Promise<{
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
    sanitize(user: User): Promise<Partial<{
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
    }>>;
    listFavorites(userId: string): Promise<{
        createdAt: Date;
        id: string;
        userId: string;
        resourceType: import(".prisma/client").$Enums.ResourceType;
        resourceId: string;
    }[]>;
    addFavorite(userId: string, dto: {
        resourceType: any;
        resourceId: string;
    }): Promise<{
        createdAt: Date;
        id: string;
        userId: string;
        resourceType: import(".prisma/client").$Enums.ResourceType;
        resourceId: string;
    }>;
    removeFavorite(userId: string, id: string): Promise<{
        ok: boolean;
    }>;
    addRecent(userId: string, dto: {
        resourceType: any;
        resourceId: string;
        metadata?: any;
    }): Promise<any>;
    getUserEvents(userId: string): Promise<{
        data: {
            userRole: string;
            registrationDate: Date;
            createdAt: Date;
            description: string;
            title: string;
            name: string;
            id: string;
            location: string;
            color: string;
            start: Date;
            end: Date;
            timed: boolean;
            timezone: string;
            published: boolean;
        }[];
        meta: {
            total: number;
            created: number;
            registered: number;
        };
    }>;
    private checkResourceExists;
}

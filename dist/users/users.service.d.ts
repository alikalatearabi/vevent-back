import { PrismaClient, User, Prisma } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findById(id: string): Promise<{
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
    findByEmail(email: string): Promise<{
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
    createUser(data: Prisma.UserCreateInput): Promise<{
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
    sanitize(user: User): Promise<Partial<{
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
    }>>;
    listFavorites(userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        resourceType: import(".prisma/client").$Enums.ResourceType;
        resourceId: string;
    }[]>;
    addFavorite(userId: string, dto: {
        resourceType: any;
        resourceId: string;
    }): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
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
            id: string;
            createdAt: Date;
            name: string;
            description: string;
            title: string;
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

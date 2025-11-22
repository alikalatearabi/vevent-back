import { PrismaClient, User, Prisma } from '@prisma/client';
import { AssetService } from '../common/services/asset.service';
export declare class UsersService {
    private readonly prisma;
    private readonly assetService;
    constructor(prisma: PrismaClient, assetService: AssetService);
    findById(id: string): Promise<{
        avatarAsset: {
            url: string;
            id: string;
            type: string;
        };
    } & {
        id: string;
        email: string;
        firstname: string;
        lastname: string;
        passwordHash: string;
        phone: string;
        company: string | null;
        jobTitle: string | null;
        role: import(".prisma/client").$Enums.Role;
        avatarAssetId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        firstname: string;
        lastname: string;
        passwordHash: string;
        phone: string;
        company: string | null;
        jobTitle: string | null;
        role: import(".prisma/client").$Enums.Role;
        avatarAssetId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    createUser(data: Prisma.UserCreateInput): Promise<{
        id: string;
        email: string;
        firstname: string;
        lastname: string;
        passwordHash: string;
        phone: string;
        company: string | null;
        jobTitle: string | null;
        role: import(".prisma/client").$Enums.Role;
        avatarAssetId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    sanitize(user: User): Promise<Partial<{
        id: string;
        email: string;
        firstname: string;
        lastname: string;
        passwordHash: string;
        phone: string;
        company: string | null;
        jobTitle: string | null;
        role: import(".prisma/client").$Enums.Role;
        avatarAssetId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>>;
    getUserStatusFlags(userId: string): Promise<{
        isProfileComplete: boolean;
        isEventRegistered: boolean;
        isPaymentComplete: boolean;
    }>;
    listFavorites(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        resourceType: import(".prisma/client").$Enums.ResourceType;
        resourceId: string;
    }[]>;
    addFavorite(userId: string, dto: {
        resourceType: any;
        resourceId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
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
            end: Date;
            id: string;
            createdAt: Date;
            name: string;
            title: string;
            description: string;
            color: string;
            start: Date;
            timed: boolean;
            location: string;
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
    completeProfile(userId: string, data: {
        firstName: string;
        lastName: string;
        email: string;
        company?: string;
        jobTitle?: string;
        password?: string;
        toc: boolean;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            isProfileComplete: boolean;
            isEventRegistered: boolean;
            isPaymentComplete: boolean;
            id: string;
            email: string;
            firstname: string;
            lastname: string;
            phone: string;
            company: string;
            jobTitle: string;
            role: import(".prisma/client").$Enums.Role;
            avatarAssetId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data: {
            avatarAssetId: string;
            avatarUrl: string;
        };
    }>;
}

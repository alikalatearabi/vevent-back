import { PrismaClient, User, Prisma } from '@prisma/client';
import { AssetService } from '../common/services/asset.service';
import { PaymentBypassService } from '../auth/services/payment-bypass.service';
export declare class UsersService {
    private readonly prisma;
    private readonly assetService;
    private readonly paymentBypassService;
    constructor(prisma: PrismaClient, assetService: AssetService, paymentBypassService: PaymentBypassService);
    findById(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        attendees: {
            id: string;
            eventId: string;
            role: import(".prisma/client").$Enums.AttendeeRole;
            showCompany: boolean;
            showEmail: boolean;
            showPhone: boolean;
        }[];
        firstname: string;
        lastname: string;
        email: string;
        phone: string;
        company: string;
        jobTitle: string;
        role: import(".prisma/client").$Enums.Role;
        avatarAssetId: string;
        avatarAsset: {
            id: string;
            type: string;
            url: string;
        };
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        firstname: string;
        lastname: string;
        email: string;
        passwordHash: string;
        phone: string;
        company: string | null;
        jobTitle: string | null;
        role: import(".prisma/client").$Enums.Role;
        avatarAssetId: string | null;
        isPaymentFree: boolean;
    }>;
    createUser(data: Prisma.UserCreateInput): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        firstname: string;
        lastname: string;
        email: string;
        passwordHash: string;
        phone: string;
        company: string | null;
        jobTitle: string | null;
        role: import(".prisma/client").$Enums.Role;
        avatarAssetId: string | null;
        isPaymentFree: boolean;
    }>;
    sanitize(user: User): Promise<Partial<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        firstname: string;
        lastname: string;
        email: string;
        passwordHash: string;
        phone: string;
        company: string | null;
        jobTitle: string | null;
        role: import(".prisma/client").$Enums.Role;
        avatarAssetId: string | null;
        isPaymentFree: boolean;
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
            id: string;
            description: string;
            createdAt: Date;
            name: string;
            title: string;
            color: string;
            start: Date;
            end: Date;
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
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            firstname: string;
            lastname: string;
            email: string;
            phone: string;
            company: string;
            jobTitle: string;
            role: import(".prisma/client").$Enums.Role;
            avatarAssetId: string;
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
    setPaymentFreeStatus(userId: string, isPaymentFree: boolean): Promise<{
        success: boolean;
        message: string;
        user: {
            id: string;
            phone: string;
            email: string;
            firstname: string;
            lastname: string;
            isPaymentFree: boolean;
        };
    }>;
    getAllPaymentFreeUsers(): Promise<{
        ownerPhone: string;
        speakerPhones: string[];
        paymentFreeUsers: {
            id: string;
            firstname: string;
            lastname: string;
            email: string;
            phone: string;
            isPaymentFree: boolean;
        }[];
        totalCount: number;
    }>;
    setPaymentFreeStatusByPhone(phone: string, isPaymentFree: boolean): Promise<{
        success: boolean;
        message: string;
        user: {
            id: string;
            phone: string;
            email: string;
            firstname: string;
            lastname: string;
            isPaymentFree: boolean;
        };
    }>;
}

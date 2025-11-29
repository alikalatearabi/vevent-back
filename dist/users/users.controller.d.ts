import { UsersService } from './users.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { CreateRecentDto } from './dto/create-recent.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(req: any): Promise<any>;
    listFavorites(req: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        resourceType: import(".prisma/client").$Enums.ResourceType;
        resourceId: string;
    }[]>;
    addFavorite(req: any, dto: CreateFavoriteDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        resourceType: import(".prisma/client").$Enums.ResourceType;
        resourceId: string;
    }>;
    removeFavorite(req: any, id: string): Promise<{
        ok: boolean;
    }>;
    addRecent(req: any, dto: CreateRecentDto): Promise<any>;
    getUserEvents(req: any): Promise<{
        data: {
            userRole: string;
            registrationDate: Date;
            id: string;
            createdAt: Date;
            name: string;
            title: string;
            description: string;
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
    completeProfile(req: any, dto: CompleteProfileDto): Promise<{
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
    completeProfilePost(req: any, dto: CompleteProfileDto): Promise<{
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
    uploadAvatar(req: any, file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data: {
            avatarAssetId: string;
            avatarUrl: string;
        };
    }>;
}

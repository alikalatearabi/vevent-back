import { UsersService } from './users.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { CreateRecentDto } from './dto/create-recent.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(req: any): Promise<Partial<{
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
    listFavorites(req: any): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        resourceType: import(".prisma/client").$Enums.ResourceType;
        resourceId: string;
    }[]>;
    addFavorite(req: any, dto: CreateFavoriteDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
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
}

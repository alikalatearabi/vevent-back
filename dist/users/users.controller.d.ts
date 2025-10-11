import { UsersService } from './users.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { CreateRecentDto } from './dto/create-recent.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(req: any): Promise<Partial<{
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
    listFavorites(req: any): Promise<{
        createdAt: Date;
        id: string;
        userId: string;
        resourceType: import(".prisma/client").$Enums.ResourceType;
        resourceId: string;
    }[]>;
    addFavorite(req: any, dto: CreateFavoriteDto): Promise<{
        createdAt: Date;
        id: string;
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
}

import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(req: any): Promise<Partial<{
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

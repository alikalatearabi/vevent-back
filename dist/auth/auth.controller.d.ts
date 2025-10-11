import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, res: any): Promise<{
        user: {
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
        };
        accessToken: string;
    }>;
    login(dto: LoginDto, res: any): Promise<{
        user: {
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
        };
        accessToken: string;
    }>;
    refresh(req: any, res: any): Promise<{
        accessToken: string;
    }>;
    logout(req: any, res: any): Promise<{
        message: string;
    }>;
}

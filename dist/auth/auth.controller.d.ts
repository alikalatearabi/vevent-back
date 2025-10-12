import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, res: any): Promise<{
        user: {
            id: string;
            email: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.Role;
            firstname: string;
            lastname: string;
            avatarAssetId: string;
            isActive: boolean;
            updatedAt: Date;
            deletedAt: Date;
        };
        accessToken: string;
    }>;
    login(dto: LoginDto, res: any): Promise<{
        user: {
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

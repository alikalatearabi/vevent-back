import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, res: any): Promise<{
        user: {
            id: string;
            firstname: string;
            lastname: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            avatarAssetId: string;
        };
        accessToken: string;
    }>;
    login(dto: LoginDto, res: any): Promise<{
        user: {
            id: string;
            firstname: string;
            lastname: string;
            email: string;
            passwordHash: string;
            phone: string;
            company: string | null;
            jobTitle: string | null;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            avatarAssetId: string | null;
        };
        accessToken: string;
    }>;
    refresh(req: any, res: any): Promise<{
        accessToken: string;
    }>;
    logout(req: any, res: any): Promise<{
        message: string;
    }>;
    sendOtp(dto: SendOtpDto): Promise<{
        success: boolean;
        sessionId: string;
        message: string;
        expiresIn: number;
    }>;
}

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, res: any): Promise<{
        user: {
            id: string;
            email: string;
            firstname: string;
            lastname: string;
            role: import(".prisma/client").$Enums.Role;
            avatarAssetId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
        };
        accessToken: string;
    }>;
    login(dto: LoginDto, res: any): Promise<{
        user: {
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
        };
        accessToken: string;
    }>;
    refresh(req: any, res: any): Promise<{
        accessToken: string;
    }>;
    logout(req: any, res: any): Promise<{
        message: string;
    }>;
    sendOtp(dto: SendOtpDto, req: any): Promise<{
        success: boolean;
        sessionId: string;
        message: string;
        expiresIn: number;
    }>;
    verifyOtp(dto: VerifyOtpDto, res: any): Promise<{
        success: boolean;
        user: {
            id: string;
            phone: string;
            email: string;
            firstname: string;
            lastname: string;
            isProfileComplete: boolean;
            isEventRegistered: boolean;
            isPaymentComplete: boolean;
        };
        accessToken: string;
    }>;
}

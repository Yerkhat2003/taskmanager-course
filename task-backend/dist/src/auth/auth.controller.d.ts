import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(res: Response, dto: RegisterDto): Promise<{
        accessToken: string;
    }>;
    login(res: Response, dto: LoginDto): Promise<{
        accessToken: string;
    }>;
    refresh(res: Response): Promise<{
        accessToken: string;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    me(req: Request): Promise<Express.User | undefined>;
    private setRefreshCookie;
}

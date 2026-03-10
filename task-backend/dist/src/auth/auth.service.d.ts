import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
interface Tokens {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<Tokens>;
    login(dto: LoginDto): Promise<Tokens>;
    refresh(refreshToken: string | undefined): Promise<Tokens>;
    private issueTokens;
}
export {};

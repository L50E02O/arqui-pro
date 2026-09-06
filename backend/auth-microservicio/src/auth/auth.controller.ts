import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    Headers,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiKeyGuard } from './guards/api-key.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 attempts per 15 minutes
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshAccessToken(refreshTokenDto.refresh_token);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(@Request() req, @Headers('authorization') authorization: string) {
        const token = authorization.replace('Bearer ', '');
        return this.authService.logout(req.user.userId, token);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@Request() req) {
        return this.authService.getCurrentUser(req.user.userId);
    }

    @Get('validate')
    async validateToken(@Headers('authorization') authorization: string) {
        if (!authorization) {
            return { valid: false, message: 'No token provided' };
        }

        const token = authorization.replace('Bearer ', '');

        try {
            return await this.authService.validateToken(token);
        } catch (error) {
            return { valid: false, message: error.message };
        }
    }

    /**
     * Endpoint para limpiar tokens expirados.
     * Protegido con API Key para uso por servicios externos (n8n).
     * Elimina tokens revocados y refresh tokens que ya expiraron.
     */
    @Post('cleanup-tokens')
    @UseGuards(ApiKeyGuard)
    @HttpCode(HttpStatus.OK)
    async cleanupTokens() {
        return this.authService.cleanupExpiredTokens();
    }
}

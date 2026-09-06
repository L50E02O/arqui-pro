import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthProxyController } from './auth-proxy/auth-proxy.controller';
import { TokenValidationMiddleware } from './middleware/token-validation.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        HttpModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ACCESS_SECRET'),
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthProxyController],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        // Only apply token validation to protected routes, NOT to login, register, refresh, etc.
        // However, since we're proxying EVERYTHING starting with /auth, 
        // we need to be careful.

        // For now, let's say /auth/me is protected
        consumer
            .apply(TokenValidationMiddleware)
            .forRoutes(
                { path: 'auth/me', method: RequestMethod.GET },
                // Add other protected routes here
            );
    }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AuthController } from './auth.controller';
import { Usuario } from '../entities/usuario.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RevokedToken } from '../entities/revoked-token.entity';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
    imports: [
        ConfigModule,
        PassportModule,
        JwtModule.register({}),
        TypeOrmModule.forFeature([Usuario, RefreshToken, RevokedToken]),
        RabbitMQModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, ApiKeyGuard],
    exports: [AuthService],
})
export class AuthModule { }

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevokedToken } from '../../entities/revoked-token.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private configService: ConfigService,
        @InjectRepository(RevokedToken)
        private revokedTokenRepository: Repository<RevokedToken>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
            passReqToCallback: true,
        });
    }

    async validate(req: any, payload: any) {
        // Extract token from header
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

        // Check if token is blacklisted
        const isRevoked = await this.revokedTokenRepository.findOne({
            where: { token },
        });

        if (isRevoked) {
            throw new UnauthorizedException('Token revocado');
        }

        return {
            userId: payload.sub,
            email: payload.email,
            rol: payload.rol,
        };
    }
}

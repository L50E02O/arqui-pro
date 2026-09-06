import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RevokedToken } from '../entities/revoked-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
        @InjectRepository(RevokedToken)
        private revokedTokenRepository: Repository<RevokedToken>,
        private jwtService: JwtService,
        private configService: ConfigService,
        private rabbitMQService: RabbitMQService,
    ) { }

    async register(registerDto: RegisterDto) {
        // Check if user already exists
        const existingUser = await this.usuarioRepository.findOne({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('El email ya está registrado');
        }

        // Validación síncrona de cédula con el servicio principal (APIREST)
        if (registerDto.rol === 'cliente' || registerDto.rol === 'arquitecto') {
            const apiRestUrl = this.configService.get<string>('APIREST_URL');
            const attributes = registerDto.rol === 'cliente'
                ? registerDto.cliente_attributes
                : registerDto.arquitecto_attributes;

            const cedula = attributes?.cedula;

            if (cedula) {
                try {
                    const response = await fetch(`${apiRestUrl}/identity/validate`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            rol: registerDto.rol,
                            cedula: cedula,
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new ConflictException(
                            errorData.error || `La cédula ${cedula} ya está registrada en el sistema`
                        );
                    }
                } catch (error) {
                    if (error instanceof ConflictException || error instanceof BadRequestException) {
                        throw error;
                    }
                    console.error('Error al validar identidad con APIREST:', error);
                    throw new BadRequestException('No se pudo validar la identidad en el servidor principal');
                }
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Create user
        const usuario = this.usuarioRepository.create({
            nombre: registerDto.nombre,
            apellido: registerDto.apellido,
            email: registerDto.email,
            encrypted_password: hashedPassword,
            rol: registerDto.rol,
            foto_perfil: registerDto.foto_perfil,
            estado_cuenta: 'activo',
        });

        await this.usuarioRepository.save(usuario);

        // Emit event to RabbitMQ
        await this.rabbitMQService.emit('user_created', {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            rol: usuario.rol,
            foto_perfil: usuario.foto_perfil,
            arquitecto_attributes: registerDto.arquitecto_attributes,
            cliente_attributes: registerDto.cliente_attributes,
            moderador_attributes: registerDto.moderador_attributes,
        });

        // Remove password from response
        const { encrypted_password, ...result } = usuario;
        return result;
    }

    async login(loginDto: LoginDto) {
        // Find user
        const usuario = await this.usuarioRepository.findOne({
            where: { email: loginDto.email },
        });

        if (!usuario) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Check account status
        if (usuario.estado_cuenta === 'suspendido') {
            throw new UnauthorizedException('La cuenta está suspendida');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            usuario.encrypted_password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Generate tokens
        const tokens = await this.generateTokens(usuario);

        return tokens;
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            // Verify refresh token
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            // Check if refresh token exists in database and is not revoked
            const storedToken = await this.refreshTokenRepository.findOne({
                where: { token: refreshToken, revocado: false },
                relations: ['usuario'],
            });

            if (!storedToken) {
                throw new UnauthorizedException('Refresh token inválido o revocado');
            }

            // Check if token is expired
            if (new Date() > storedToken.expiracion) {
                throw new UnauthorizedException('Refresh token expirado');
            }

            // Generate new access token
            const accessToken = this.jwtService.sign(
                {
                    sub: storedToken.usuario.id,
                    email: storedToken.usuario.email,
                    rol: storedToken.usuario.rol,
                    iss: this.configService.get<string>('JWT_ISSUER', 'auth-service'),
                },
                {
                    secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                    expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
                },
            );

            return {
                access_token: accessToken,
            };
        } catch (error) {
            throw new UnauthorizedException('Refresh token inválido');
        }
    }

    async logout(userId: string, accessToken: string) {
        // Revoke all refresh tokens for this user
        await this.refreshTokenRepository.update(
            { usuario_id: userId, revocado: false },
            { revocado: true },
        );

        // Add access token to blacklist
        const decoded = this.jwtService.decode(accessToken) as any;
        const expiresAt = new Date(decoded.exp * 1000);

        const revokedToken = this.revokedTokenRepository.create({
            token: accessToken,
            expira_en: expiresAt,
        });

        await this.revokedTokenRepository.save(revokedToken);

        return { message: 'Logout exitoso' };
    }

    async validateToken(token: string) {
        try {
            // Verify token signature and expiration
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            });

            // Check if token is blacklisted
            const isRevoked = await this.revokedTokenRepository.findOne({
                where: { token },
            });

            if (isRevoked) {
                throw new UnauthorizedException('Token revocado');
            }

            // Get user info
            const usuario = await this.usuarioRepository.findOne({
                where: { id: payload.sub },
            });

            if (!usuario || usuario.estado_cuenta === 'suspendido') {
                throw new UnauthorizedException('Usuario no válido');
            }

            return {
                valid: true,
                usuario: {
                    id: usuario.id,
                    email: usuario.email,
                    rol: usuario.rol,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                },
            };
        } catch (error) {
            throw new UnauthorizedException('Token inválido');
        }
    }

    async getCurrentUser(userId: string) {
        const usuario = await this.usuarioRepository.findOne({
            where: { id: userId },
        });

        if (!usuario) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        const { encrypted_password, ...result } = usuario;
        return result;
    }

    private async generateTokens(usuario: Usuario) {
        const payload = {
            sub: usuario.id,
            email: usuario.email,
            rol: usuario.rol,
            iss: this.configService.get<string>('JWT_ISSUER', 'auth-service'),
        };

        // Generate access token (short-lived)
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
        });

        // Generate refresh token (long-lived)
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
        });

        // Store refresh token in database
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7); // 7 days

        const refreshTokenEntity = this.refreshTokenRepository.create({
            token: refreshToken,
            usuario_id: usuario.id,
            expiracion: expirationDate,
        });

        await this.refreshTokenRepository.save(refreshTokenEntity);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'Bearer',
            expires_in: this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
        };
    }

    /**
     * Limpia tokens expirados de la base de datos.
     * Elimina tokens revocados y refresh tokens que ya expiraron.
     * 
     * @returns Estadísticas de la limpieza realizada
     */
    async cleanupExpiredTokens() {
        const now = new Date();

        // Contar tokens revocados expirados antes de eliminarlos
        const expiredRevokedCount = await this.revokedTokenRepository
            .createQueryBuilder('revoked_token')
            .where('revoked_token.expira_en < :now', { now })
            .getCount();

        // Eliminar tokens revocados expirados
        const revokedResult = await this.revokedTokenRepository
            .createQueryBuilder()
            .delete()
            .where('expira_en < :now', { now })
            .execute();

        // Contar refresh tokens expirados antes de eliminarlos
        const expiredRefreshCount = await this.refreshTokenRepository
            .createQueryBuilder('refresh_token')
            .where('refresh_token.expiracion < :now', { now })
            .getCount();

        // Eliminar refresh tokens expirados
        const refreshResult = await this.refreshTokenRepository
            .createQueryBuilder()
            .delete()
            .where('expiracion < :now', { now })
            .execute();

        return {
            success: true,
            timestamp: new Date().toISOString(),
            deleted: {
                revoked_tokens: revokedResult.affected || 0,
                refresh_tokens: refreshResult.affected || 0,
                total: (revokedResult.affected || 0) + (refreshResult.affected || 0),
            },
            found: {
                expired_revoked_tokens: expiredRevokedCount,
                expired_refresh_tokens: expiredRefreshCount,
            },
        };
    }
}

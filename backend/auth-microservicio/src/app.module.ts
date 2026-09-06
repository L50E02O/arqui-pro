import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { Usuario } from './entities/usuario.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RevokedToken } from './entities/revoked-token.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const dbHost = configService.get<string>('DB_HOST')?.trim();
                const dbPort = configService.get<string>('DB_PORT') || '5432';
                const dbUser = configService.get<string>('DB_USER')?.trim();
                const dbPass = configService.get<string>('DB_PASS')?.trim();
                const dbName = configService.get<string>('DB_NAME')?.trim();

                // Validar variables requeridas
                const missingVars: string[] = [];
                if (!dbHost) missingVars.push('DB_HOST');
                if (!dbUser) missingVars.push('DB_USER');
                if (!dbPass) missingVars.push('DB_PASS');
                if (!dbName) missingVars.push('DB_NAME');

                if (missingVars.length > 0) {
                    console.error('[ERROR] Faltan variables de entorno requeridas para la base de datos:');
                    missingVars.forEach(v => console.error(`  - ${v}`));
                    console.error('[INFO] Asegúrate de tener un archivo .env con las siguientes variables:');
                    console.error('  DB_HOST=tu_host_supabase');
                    console.error('  DB_PORT=5432');
                    console.error('  DB_USER=postgres');
                    console.error('  DB_PASS=tu_password');
                    console.error('  DB_NAME=postgres');
                    console.error('  DB_SSL=true');
                }

                return {
                    type: 'postgres',
                    host: dbHost,
                    port: parseInt(dbPort, 10),
                    username: dbUser,
                    password: dbPass,
                    database: dbName,
                    entities: [Usuario, RefreshToken, RevokedToken],
                    synchronize: true, // Set to false in production and use migrations
                    ssl: configService.get<string>('DB_SSL') === 'true' ? {
                        rejectUnauthorized: false, // Supabase requires SSL
                    } : false,
                };
            },
            inject: [ConfigService],
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 60000, // 1 minute
                limit: 10, // 10 requests per minute (global)
            },
        ]),
        AuthModule,
    ],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { VerificacionModule } from './verificacion/verificacion.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { RedisModule } from './redis/redis.module';
import { EventListenerService } from './rabbitmq/event-listener.service';

/**
 * Módulo principal del microservicio de Verificación
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5434'),
      username: process.env.DB_USERNAME || 'verificacion_user',
      password: process.env.DB_PASSWORD || 'verificacion_pass',
      database: process.env.DB_DATABASE || 'verificacion_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Usar migraciones en producción
      logging: process.env.NODE_ENV === 'development',
    }),
    VerificacionModule,
    RabbitMQModule,
    RedisModule,
  ],
  providers: [EventListenerService],
})
export class AppModule {}


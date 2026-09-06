import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ArquitectoModule } from './arquitecto/arquitecto.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

/**
 * Módulo principal del microservicio de Arquitecto
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
      port: parseInt(process.env.DB_PORT || '5433'),
      username: process.env.DB_USERNAME || 'arquitecto_user',
      password: process.env.DB_PASSWORD || 'arquitecto_pass',
      database: process.env.DB_DATABASE || 'arquitecto_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Usar migraciones en producción
      logging: process.env.NODE_ENV === 'development',
    }),
    ArquitectoModule,
    RabbitMQModule,
  ],
})
export class AppModule {}


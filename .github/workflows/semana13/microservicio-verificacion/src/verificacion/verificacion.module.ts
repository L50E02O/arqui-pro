import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificacionService } from './verificacion.service';
import { VerificacionController } from './verificacion.controller';
import { Verificacion } from './entities/verificacion.entity';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { RedisModule } from '../redis/redis.module';
import { WebhookModule } from '../webhook/webhook.module';

/**
 * Módulo de Verificación
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Verificacion]),
    RabbitMQModule,
    RedisModule,
    WebhookModule,
  ],
  controllers: [VerificacionController],
  providers: [VerificacionService],
  exports: [VerificacionService],
})
export class VerificacionModule {}


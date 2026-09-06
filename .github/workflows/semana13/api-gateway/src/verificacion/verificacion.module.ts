import { Module } from '@nestjs/common';
import { VerificacionController } from './verificacion.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

/**
 * Módulo de Verificación en el API Gateway
 */
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'VERIFICACION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'],
          queue: process.env.RABBITMQ_QUEUE_VERIFICACION || 'verificacion.queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [VerificacionController],
})
export class VerificacionModule {}


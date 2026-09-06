import { Module } from '@nestjs/common';
import { ArquitectoController } from './arquitecto.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

/**
 * Módulo de Arquitecto en el API Gateway
 */
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ARQUITECTO_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'],
          queue: process.env.RABBITMQ_QUEUE_ARQUITECTO || 'arquitecto.queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [ArquitectoController],
})
export class ArquitectoModule {}


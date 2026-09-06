import { Module, Global } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

/**
 * Módulo global de RabbitMQ
 */
@Global()
@Module({
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}


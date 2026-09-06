import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

/**
 * Inicializa el microservicio de Arquitecto
 * Configura tanto el servidor HTTP como el cliente RabbitMQ
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar microservicio RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'],
      queue: process.env.RABBITMQ_QUEUE_ARQUITECTO || 'arquitecto.queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3001);

  console.log(`Microservicio Arquitecto ejecutándose en puerto ${process.env.PORT || 3001}`);
  console.log(`RabbitMQ conectado en: ${process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'}`);
}

bootstrap();


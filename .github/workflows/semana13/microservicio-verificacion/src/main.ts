import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

/**
 * Inicializa el microservicio de Verificación
 * Configura tanto el servidor HTTP como el cliente RabbitMQ
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar microservicio RabbitMQ para mensajes RPC (usado por API Gateway)
  // Nota: Los eventos asíncronos se manejan con EventListenerService usando amqplib
  // Usamos una cola separada para RPC ('verificacion.rpc.queue') para evitar conflictos con los eventos
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'],
      queue: process.env.RABBITMQ_QUEUE_RPC || 'verificacion.rpc.queue',
      queueOptions: {
        durable: true,
      },
      // No configurar exchange aquí, los eventos se manejan con EventListenerService
      // Solo usamos esto para mensajes RPC desde el API Gateway
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3002);

  console.log(`Microservicio Verificación ejecutándose en puerto ${process.env.PORT || 3002}`);
  console.log(`RabbitMQ conectado en: ${process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'}`);
  console.log(`Cola RPC: ${process.env.RABBITMQ_QUEUE_RPC || 'verificacion.rpc.queue'}`);
}

bootstrap();


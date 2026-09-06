import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Cargar variables de entorno desde .env
dotenv.config();

/**
 * Inicializa el API Gateway
 * Punto de entrada REST que enruta a los microservicios
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors();

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 3000);

  console.log(`API Gateway ejecutándose en puerto ${process.env.PORT || 3000}`);
}

bootstrap();


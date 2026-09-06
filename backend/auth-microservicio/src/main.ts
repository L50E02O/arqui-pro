import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
        origin: true, // In production, specify exact origins
        credentials: true,
    });

    // Enable global validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const port = process.env.PORT || 4001;
    await app.listen(port);

    console.log(`[START]  Auth Microservice running on: http://localhost:${port}`);
}
bootstrap();

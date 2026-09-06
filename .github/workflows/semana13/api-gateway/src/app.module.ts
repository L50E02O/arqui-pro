import { Module } from '@nestjs/common';
import { ArquitectoModule } from './arquitecto/arquitecto.module';
import { VerificacionModule } from './verificacion/verificacion.module';
import { GeminiModule } from './gemini/gemini.module';

/**
 * Módulo principal del API Gateway
 */
@Module({
  imports: [ArquitectoModule, VerificacionModule, GeminiModule],
})
export class AppModule {}


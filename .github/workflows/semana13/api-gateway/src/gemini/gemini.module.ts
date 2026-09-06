/**
 * GeminiModule - Módulo NestJS para integración con Gemini
 * Exporta GeminiService para ser utilizado en otros módulos
 */

import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';

@Module({
  providers: [GeminiService],
  controllers: [GeminiController],
  exports: [GeminiService], // Exportar para usarlo en otros módulos
})
export class GeminiModule {}

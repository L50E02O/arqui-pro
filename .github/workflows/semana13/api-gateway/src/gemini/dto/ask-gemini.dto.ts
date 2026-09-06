/**
 * DTO para solicitud a Gemini
 */

import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class AskGeminiDto {
  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  @MinLength(1, { message: 'El mensaje debe tener al menos 1 carácter' })
  message: string;

  @IsString({ message: 'El contexto debe ser una cadena de texto' })
  context?: string;
}

export class GeminiAskResponse {
  success: boolean;
  response: string;
  timestamp: string;
  toolsUsed?: string[];
  error?: string;
}

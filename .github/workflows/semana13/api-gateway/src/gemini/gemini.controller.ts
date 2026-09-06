/**
 * GeminiController - Endpoints para interacción con Gemini
 * Procesa solicitudes de usuarios y las envía a Gemini para procesamiento
 */

import {
  Controller,
  Post,
  Body,
  Get,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { AskGeminiDto, GeminiAskResponse } from './dto/ask-gemini.dto';

@Controller('api/gemini')
export class GeminiController {
  private readonly logger = new Logger(GeminiController.name);

  constructor(private readonly geminiService: GeminiService) {}

  /**
   * POST /api/gemini/ask
   * Procesa una solicitud de usuario
   *
   * @param dto - AskGeminiDto con el mensaje del usuario
   * @returns GeminiAskResponse con la respuesta de Gemini
   *
   * Ejemplo:
   * POST /api/gemini/ask
   * {
   *   "message": "¿Cuántas verificaciones pendientes hay?"
   * }
   *
   * Respuesta:
   * {
   *   "success": true,
   *   "response": "Hay 3 verificaciones pendientes...",
   *   "toolsUsed": ["buscar_verificacion"],
   *   "timestamp": "2024-01-15T10:30:00Z"
   * }
   */
  @Post('ask')
  async ask(@Body() dto: AskGeminiDto): Promise<GeminiAskResponse> {
    try {
      this.logger.log(
        `[ask] Solicitud recibida: "${dto.message.substring(0, 50)}..."`,
      );

      const { response, toolsUsed } =
        await this.geminiService.processUserRequest(dto.message);

      const result: GeminiAskResponse = {
        success: true,
        response,
        timestamp: new Date().toISOString(),
        toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
      };

      this.logger.log('[ask] Respuesta generada exitosamente');
      return result;
    } catch (error: any) {
      this.logger.error('[ask] Error procesando solicitud:', error.message);

      throw new HttpException(
        {
          success: false,
          error: error.message || 'Error procesando solicitud con Gemini',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/gemini/health
   * Verifica el estado de Gemini y MCP Server
   *
   * Respuesta:
   * {
   *   "success": true,
   *   "gemini": true,
   *   "mcpServer": true,
   *   "timestamp": "2024-01-15T10:30:00Z"
   * }
   */
  @Get('health')
  async health(): Promise<any> {
    try {
      const status = await this.geminiService.healthCheck();

      return {
        success: true,
        provider: status.provider,
        ai: status.ai,
        mcpServer: status.mcpServer,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error('[health] Error en health check:', error.message);

      throw new HttpException(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/gemini/tools
   * Lista las tools disponibles para Gemini
   *
   * Respuesta:
   * {
   *   "success": true,
   *   "tools": [
   *     {
   *       "name": "buscar_verificacion",
   *       "description": "...",
   *       "input_schema": {...}
   *     },
   *     ...
   *   ],
   *   "timestamp": "2024-01-15T10:30:00Z"
   * }
   */
  @Get('tools')
  async getTools(): Promise<any> {
    try {
      const tools = this.geminiService.getMCPTools();

      return {
        success: true,
        count: tools.length,
        tools,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error('[getTools] Error listando tools:', error.message);

      throw new HttpException(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /api/gemini/test
   * Endpoint de prueba para validar la integración
   *
   * Ejemplo:
   * POST /api/gemini/test
   * {
   *   "message": "Hola, ¿cuál es tu nombre?"
   * }
   */
  @Post('test')
  async test(@Body() dto: AskGeminiDto): Promise<GeminiAskResponse> {
    try {
      this.logger.log('[test] Ejecutando prueba de Gemini');

      // Este endpoint es igual al /ask pero con mensajes descriptivos adicionales
      const { response, toolsUsed } =
        await this.geminiService.processUserRequest(dto.message);

      return {
        success: true,
        response: `[TEST] Respuesta: ${response}`,
        timestamp: new Date().toISOString(),
        toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
      };
    } catch (error: any) {
      this.logger.error('[test] Error en prueba:', error.message);

      throw new HttpException(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

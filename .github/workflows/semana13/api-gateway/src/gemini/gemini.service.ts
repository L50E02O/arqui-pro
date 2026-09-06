/**
 * GeminiService - Integración con múltiples proveedores de IA
 * Soporta: Google Gemini y DeepSeek
 * Maneja la comunicación con el proveedor de IA y ejecución de tools MCP
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  SchemaType,
  type FunctionDeclaration,
} from '@google/generative-ai';
import OpenAI from 'openai';
import axios from 'axios';

/**
 * Interfaz para las definiciones de tools de MCP
 */
interface MCPTool {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

type AIProvider = 'gemini' | 'deepseek';

@Injectable()
export class GeminiService {
  private geminiClient: GoogleGenerativeAI | null = null;
  private deepseekClient: OpenAI | null = null;
  private mcpServerUrl: string;
  private readonly logger = new Logger(GeminiService.name);
  private tools: MCPTool[];
  private provider: AIProvider;

  constructor() {
    // Determinar qué proveedor usar
    this.provider = (process.env.AI_PROVIDER as AIProvider) || 'gemini';
    this.mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:3500';

    // Inicializar el cliente según el proveedor
    if (this.provider === 'deepseek') {
      this.initializeDeepSeek();
    } else {
      this.initializeGemini();
    }

    // Inicializar tools de MCP
    this.initializeMCPTools();
  }

  /**
   * Inicializa el cliente de Google Gemini
   */
  private initializeGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY no configurada. Gemini no funcionará sin ella.',
      );
    }
    this.geminiClient = new GoogleGenerativeAI(apiKey || '');
    this.logger.log('[GeminiService] Proveedor: Gemini');
  }

  /**
   * Inicializa el cliente de DeepSeek (soporta OpenRouter)
   */
  private initializeDeepSeek() {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'DEEPSEEK_API_KEY no configurada. DeepSeek no funcionará sin ella.',
      );
    }
    
    // Detectar si es una API key de OpenRouter
    const isOpenRouter = apiKey?.startsWith('sk-or-');
    const baseURL = isOpenRouter 
      ? (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1')
      : 'https://api.deepseek.com';
    
    this.deepseekClient = new OpenAI({
      apiKey: apiKey || '',
      baseURL,
      defaultHeaders: isOpenRouter ? {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'ASW Verificaciones',
      } : undefined,
    });
    
    this.logger.log(`[GeminiService] Proveedor: DeepSeek via ${isOpenRouter ? 'OpenRouter' : 'API directa'}`);
  }

  /**
   * Obtener el modelo a usar según el proveedor
   */
  private getModel(): string {
    if (this.provider === 'deepseek') {
      return process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    }
    return process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }

  /**
   * Inicializa las definiciones de tools de MCP
   */
  private initializeMCPTools() {
    this.tools = [
      {
        name: 'buscar_verificacion',
        description:
          'Busca verificaciones en el sistema según criterios específicos. ' +
          'Permite filtrar por ID único, arquitecto responsable, estado actual (PENDIENTE, VERIFICADO, RECHAZADO, EN_PROGRESO), ' +
          'y soporta paginación. Retorna una lista de verificaciones que coinciden con los criterios.',
        input_schema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description:
                'ID único de la verificación para búsqueda exacta. Si se proporciona, ignora otros criterios.',
            },
            arquitectoId: {
              type: 'string',
              description:
                'ID del arquitecto propietario de la verificación. Permite filtrar verificaciones por responsable.',
            },
            estado: {
              type: 'string',
              enum: ['PENDIENTE', 'VERIFICADO', 'RECHAZADO', 'EN_PROGRESO'],
              description:
                'Estado actual de la verificación. Usa: PENDIENTE (sin procesar), VERIFICADO (aprobado), ' +
                'RECHAZADO (no aprobado), EN_PROGRESO (siendo procesado).',
            },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              description:
                'Número máximo de resultados a retornar. Rango: 1-100. Default: 10. Útil para paginación.',
            },
            offset: {
              type: 'number',
              minimum: 0,
              description:
                'Número de registros a saltar. Default: 0. Usa con limit para paginar.',
            },
          },
        },
      },
      {
        name: 'es_pendiente',
        description:
          'Verifica rápidamente si una verificación específica está en estado PENDIENTE. ' +
          'Retorna un booleano y el estado actual. Úsalo para validaciones antes de cambios de estado.',
        input_schema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description:
                'ID único de la verificación a validar. Requerido. Ejemplo: "verify-123".',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'cambiar_a_verificado',
        description:
          'Cambia el estado de una verificación a VERIFICADO. ' +
          'Requiere que esté en estado PENDIENTE o EN_PROGRESO. ' +
          'Opcionalmente acepta una razón para auditoría y trazabilidad. ' +
          'Retorna la verificación actualizada.',
        input_schema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description:
                'ID único de la verificación a actualizar. Requerido. Debe existir en el sistema.',
            },
            razon: {
              type: 'string',
              description:
                'Razón o comentario del cambio de estado para auditoría. ' +
                'Opcional. Registra quién y por qué cambió el estado.',
            },
          },
          required: ['id'],
        },
      },
    ];

    this.logger.log(
      `[GeminiService] Inicializado con ${this.tools.length} tools MCP`,
    );
  }

  /**
   * Obtiene las tools MCP para exponer al proveedor de IA
   */
  getMCPTools() {
    return this.tools;
  }

  /**
   * Mapea tipos de schema JSON a SchemaType (para Gemini)
   */
  private mapSchemaType(type: string): SchemaType {
    const typeMap: Record<string, SchemaType> = {
      string: SchemaType.STRING,
      number: SchemaType.NUMBER,
      integer: SchemaType.INTEGER,
      boolean: SchemaType.BOOLEAN,
      array: SchemaType.ARRAY,
      object: SchemaType.OBJECT,
    };
    return typeMap[type] || SchemaType.STRING;
  }

  /**
   * Ejecuta una tool MCP
   */
  private async executeMCPTool(
    toolName: string,
    params: Record<string, any>,
  ): Promise<any> {
    try {
      this.logger.debug(
        `[executeMCPTool] Ejecutando: ${toolName}`,
        JSON.stringify(params),
      );

      const response = await axios.post(
        `${this.mcpServerUrl}/rpc`,
        {
          jsonrpc: '2.0',
          id: `${toolName}-${Date.now()}`,
          method: 'tools.call',
          params: {
            name: toolName,
            params: params,
          },
        },
        { timeout: 15000 },
      );

      if (response.data.error) {
        this.logger.error(
          `[executeMCPTool] Error MCP: ${response.data.error.message}`,
        );
        throw new Error(`MCP Error: ${response.data.error.message}`);
      }

      this.logger.debug(
        `[executeMCPTool] Éxito: ${toolName}`,
        response.data.result,
      );
      return response.data.result;
    } catch (error: any) {
      this.logger.error(
        `[executeMCPTool] Error ejecutando ${toolName}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Procesa una solicitud de usuario
   * Delega al proveedor configurado (Gemini o DeepSeek)
   */
  async processUserRequest(userMessage: string): Promise<{
    response: string;
    toolsUsed: string[];
  }> {
    if (this.provider === 'deepseek') {
      return this.processWithDeepSeek(userMessage);
    }
    return this.processWithGemini(userMessage);
  }

  /**
   * Procesa con DeepSeek
   */
  private async processWithDeepSeek(userMessage: string): Promise<{
    response: string;
    toolsUsed: string[];
  }> {
    try {
      this.logger.log(
        `[processWithDeepSeek] Procesando mensaje: "${userMessage.substring(0, 50)}..."`,
      );

      if (!this.deepseekClient) {
        throw new Error('DeepSeek client no inicializado');
      }

      const modelName = this.getModel();
      const toolsUsed: string[] = [];

      // Convertir tools al formato OpenAI
      const openaiTools: OpenAI.ChatCompletionTool[] = this.tools.map(
        (tool) => ({
          type: 'function' as const,
          function: {
            name: tool.name,
            description: tool.description,
            parameters: {
              type: 'object',
              properties: tool.input_schema.properties,
              required: tool.input_schema.required || [],
            },
          },
        }),
      );

      // Primera llamada: DeepSeek analiza el mensaje
      const messages: OpenAI.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content:
            'Eres un asistente que ayuda a gestionar verificaciones arquitectónicas. ' +
            'Usa las herramientas disponibles para responder consultas sobre verificaciones.',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ];

      let response = await this.deepseekClient.chat.completions.create({
        model: modelName,
        messages,
        tools: openaiTools,
        tool_choice: 'auto',
      });

      let assistantMessage = response.choices[0].message;

      // Mientras haya tool calls, ejecutarlas
      while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        this.logger.log(
          `[processWithDeepSeek] Ejecutando ${assistantMessage.tool_calls.length} tools`,
        );

        // Agregar el mensaje del asistente
        messages.push(assistantMessage);

        // Ejecutar cada tool
        for (const toolCall of assistantMessage.tool_calls) {
          // Acceder a la función de forma segura
          const func = (toolCall as any).function;
          const toolName = func?.name || 'unknown';
          toolsUsed.push(toolName);

          this.logger.log(`[processWithDeepSeek] Ejecutando tool: ${toolName}`);

          let toolResult: any;
          try {
            const args = JSON.parse(func?.arguments || '{}');
            toolResult = await this.executeMCPTool(toolName, args);
          } catch (error: any) {
            this.logger.error(
              `[processWithDeepSeek] Error en tool ${toolName}:`,
              error.message,
            );
            toolResult = { error: error.message };
          }

          // Agregar resultado de la tool
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });
        }

        // Siguiente llamada con los resultados
        response = await this.deepseekClient.chat.completions.create({
          model: modelName,
          messages,
          tools: openaiTools,
          tool_choice: 'auto',
        });

        assistantMessage = response.choices[0].message;
      }

      const finalText = assistantMessage.content || 'Sin respuesta';
      this.logger.log('[processWithDeepSeek] Respuesta generada');

      return {
        response: finalText,
        toolsUsed,
      };
    } catch (error: any) {
      this.logger.error(
        '[processWithDeepSeek] Error procesando solicitud:',
        error.message,
      );
      throw error;
    }
  }

  /**
   * Procesa con Gemini (código original)
   */
  private async processWithGemini(userMessage: string): Promise<{
    response: string;
    toolsUsed: string[];
  }> {
    try {
      this.logger.log(
        `[processWithGemini] Procesando mensaje: "${userMessage.substring(0, 50)}..."`,
      );

      if (!this.geminiClient) {
        throw new Error('Gemini client no inicializado');
      }

      const modelName = this.getModel();
      const model = this.geminiClient.getGenerativeModel({ model: modelName });

      // Primera llamada: Gemini analiza el mensaje y decide qué tools usar
      const firstResponse = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }],
          },
        ],
        tools: [
          {
            functionDeclarations: this.tools.map((tool) => ({
              name: tool.name,
              description: tool.description,
              parameters: {
                type: SchemaType.OBJECT,
                properties: Object.fromEntries(
                  Object.entries(tool.input_schema.properties).map(
                    ([key, value]: [string, any]) => [
                      key,
                      {
                        type: this.mapSchemaType(value.type),
                        description: value.description,
                        ...(value.enum ? { enum: value.enum } : {}),
                      },
                    ],
                  ),
                ),
                required: tool.input_schema.required || [],
              },
            })) as FunctionDeclaration[],
          },
        ],
      });

      const result = await firstResponse.response;
      const content = result.candidates?.[0]?.content;

      if (!content) {
        this.logger.warn('[processWithGemini] No hay contenido en respuesta');
        return {
          response: 'No se pudo procesar la solicitud.',
          toolsUsed: [],
        };
      }

      // Rastrear tools usadas
      const toolsUsed: string[] = [];

      // Si Gemini decidió ejecutar una tool
      if (content.parts.some((part) => 'functionCall' in part)) {
        this.logger.log('[processWithGemini] Gemini decidió ejecutar tools');

        const toolResults = [];

        // Ejecutar cada tool que Gemini solicitó
        for (const part of content.parts) {
          if ('functionCall' in part) {
            const functionCall = (part as any).functionCall;
            this.logger.log(
              `[processWithGemini] Ejecutando tool: ${functionCall.name}`,
            );

            toolsUsed.push(functionCall.name);

            try {
              const result = await this.executeMCPTool(
                functionCall.name,
                functionCall.args || {},
              );

              toolResults.push({
                functionResponse: {
                  name: functionCall.name,
                  response: result,
                },
              });
            } catch (error: any) {
              this.logger.error(
                `[processWithGemini] Error ejecutando tool ${functionCall.name}:`,
                error.message,
              );

              toolResults.push({
                functionResponse: {
                  name: functionCall.name,
                  response: {
                    error: error.message,
                  },
                },
              });
            }
          }
        }

        // Segunda llamada: Gemini procesa resultados y genera respuesta final
        this.logger.log(
          `[processWithGemini] Generando respuesta final con ${toolResults.length} resultados`,
        );

        const finalResponse = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: userMessage }],
            },
            {
              role: 'model',
              parts: content.parts,
            },
            {
              role: 'user',
              parts: toolResults,
            },
          ],
        });

        // Extraer texto de la respuesta final
        const finalResult = await finalResponse.response;
        const finalText = finalResult.candidates?.[0]?.content?.parts
          .filter((part) => 'text' in part)
          .map((part) => (part as any).text)
          .join('\n');

        this.logger.log('[processWithGemini] Respuesta final generada');
        return {
          response: finalText || 'No se pudo generar una respuesta adecuada.',
          toolsUsed,
        };
      }

      // Si Gemini no necesitó tools, retornar su respuesta directa
      this.logger.log('[processWithGemini] Respuesta directa de Gemini');
      const text = content.parts
        .filter((part) => 'text' in part)
        .map((part) => (part as any).text)
        .join('\n');

      return {
        response: text || 'Respuesta vacía de Gemini',
        toolsUsed,
      };
    } catch (error: any) {
      this.logger.error(
        '[processWithGemini] Error procesando solicitud:',
        error.message,
      );
      throw error;
    }
  }

  /**
   * Health check - verifica que el proveedor de IA y MCP Server estén disponibles
   */
  async healthCheck(): Promise<{
    provider: string;
    ai: boolean;
    mcpServer: boolean;
  }> {
    const results = {
      provider: this.provider,
      ai: false,
      mcpServer: false,
    };

    // Verificar proveedor de IA
    try {
      if (this.provider === 'deepseek') {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (apiKey && this.deepseekClient) {
          results.ai = true;
          this.logger.debug('[healthCheck] DeepSeek: OK');
        }
      } else {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey && this.geminiClient) {
          results.ai = true;
          this.logger.debug('[healthCheck] Gemini: OK');
        }
      }
    } catch (error) {
      this.logger.warn('[healthCheck] AI: Error en verificación', error);
    }

    // Verificar MCP Server
    try {
      const response = await axios.get(`${this.mcpServerUrl}/health`, {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 500,
      });
      results.mcpServer = response.status === 200;
      if (results.mcpServer) {
        this.logger.debug('[healthCheck] MCP Server: OK');
      } else {
        this.logger.warn(
          `[healthCheck] MCP Server: Respondió con status ${response.status}`,
        );
      }
    } catch (error: any) {
      this.logger.warn(
        `[healthCheck] MCP Server no disponible: ${this.mcpServerUrl}`,
        error.message || error,
      );
      results.mcpServer = false;
    }

    return results;
  }
}

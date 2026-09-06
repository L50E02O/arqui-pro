/**/**





















































































































































































































































































































































































































































































































};  envConfig: ENV_CONFIG,  },    complexSearch: 'Búsqueda con múltiples criterios',    validationWithChange: 'Validar estado antes de cambiar',    simpleSearch: 'Búsqueda simple de verificaciones',  flows: {  tools: MCPToolsDefinition.tools,export const MCPIntegrationExample = {// ============================================================================// EXPORTAR PARA TESTING// ============================================================================ */ *   - Manejo centralizado de errores *   - Control de parámetros y límites *   - Validación JSON Schema en MCP * ✓ Seguridad *  *   - Errores claros y descriptivos *   - Rastreo de requests end-to-end *   - Logs en cada nivel (API, MCP, Backend) * ✓ Debugging y Auditoría *  *   - No solo Gemini *   - Puede ser consumido por cualquier cliente MCP *   - Sigue estándar JSON-RPC 2.0 * ✓ Compatibilidad MCP *  *   - Fácil agregar nuevas tools sin modificar API Gateway *   - MCP Server puede replicarse para balanceo de carga * ✓ Escalabilidad *  *   - Backend: Lógica de negocio y persistencia *   - MCP Server: Definición e implementación de tools JSON-RPC *   - API Gateway: Entrada y orquestación HTTP * ✓ Separación de responsabilidades/**// ============================================================================// 7. VENTAJAS DE ESTA ARQUITECTURA// ============================================================================`;BACKEND_BASE_URL=http://localhost:3001# Backend ConfigurationMCP_SERVER_URL=http://localhost:9000# MCP Server URLGEMINI_MODEL=gemini-proGEMINI_API_KEY=your_gemini_api_key_here# Gemini Configurationconst ENV_CONFIG = ` */ * .env en api-gateway/**// ============================================================================// 6. VARIABLES DE ENTORNO NECESARIAS// ============================================================================ */ *   "El arquitecto arch-456 tiene 3 verificaciones pendientes" * Gemini: *  *   2. Retorna verificaciones filtradas *   1. Llama a backend con ambos filtros * MCP Server: *  *   1. Ejecutar buscar_verificacion(arquitectoId: "arch-456", estado: "PENDIENTE") * Gemini decide: *  *   { "message": "¿Cuáles son las verificaciones pendientes del arquitecto arch-456?" } *   POST /api/gemini/ask * Usuario: *  * FLUJO 3: Búsqueda compleja/** */ *   "La verificación verify-123 ha sido marcada como verificada exitosamente" * Gemini: *  *   2. cambiar_a_verificado → Actualiza a VERIFICADO *   1. es_pendiente → Obtiene estado actual * MCP Server: *  *   3. Si es false → informar que no puede cambiar *   2. Si es true → ejecutar cambiar_a_verificado(id: "verify-123") *   1. Primero ejecutar es_pendiente(id: "verify-123") * Gemini decide: *  *   { "message": "Marca verify-123 como verificado" } *   POST /api/gemini/ask * Usuario: *  * FLUJO 2: Validación con cambio/** */ *   "Hay 5 verificaciones pendientes en el sistema" *   Procesa resultado y responde: * Gemini: *  *   2. Retorna lista de verificaciones *   1. Llama a backend: GET /api/verificacion/buscar?estado=PENDIENTE * MCP Server: *  *   1. Ejecutar buscar_verificacion(estado: "PENDIENTE") * Gemini decide: *  *   { "message": "¿Cuántas verificaciones pendientes hay?" } *   POST /api/gemini/ask * Usuario: *  * FLUJO 1: Búsqueda simple/**// ============================================================================// 5. FLUJOS DE EJEMPLO// ============================================================================}  }    }      };        timestamp: new Date().toISOString(),        error: error.message,        success: false,      return {    } catch (error: any) {      };        timestamp: new Date().toISOString(),        response,        success: true,      return {      const response = await this.geminiService.processUserRequest(message);    try {  async ask(@Body('message') message: string) {  @Post('ask')  constructor(private geminiService: GeminiService) {}export class GeminiController {@Controller('api/gemini')import { GeminiService } from './gemini.service';import { Controller, Post, Body } from '@nestjs/common'; */ * archivo: api-gateway/src/gemini/gemini.controller.ts/**// ============================================================================// 4. CONTROLLER EN API GATEWAY// ============================================================================}  }    return text;      .join('\n');      .map((part) => (part as any).text)      .filter((part) => 'text' in part)    const text = content.parts    // Si Gemini no necesitó tools, retornar su respuesta directa    }      return finalText;        .join('\n');        .map((part) => (part as any).text)        .filter((part) => 'text' in part)      const finalText = finalResponse.candidates[0].content.parts      // Extraer texto de la respuesta final      });        ],          },            parts: toolResults,            role: 'user',          {          },            parts: content.parts,            role: 'model',          {          },            parts: [{ text: userMessage }],            role: 'user',          {        contents: [      const finalResponse = await model.generateContent({      // Segunda llamada: Gemini procesa resultados y genera respuesta final      }        }          }            });              },                },                  error: error.message,                response: {                name: functionCall.name,              functionResponse: {            toolResults.push({          } catch (error: any) {            });              },                response: result,                name: functionCall.name,              functionResponse: {            toolResults.push({            );              functionCall.args || {},              functionCall.name,            const result = await this.executeMCPTool(          try {          );            functionCall.args,            `Ejecutando tool: ${functionCall.name}`,          console.log(          const functionCall = part.functionCall;        if ('functionCall' in part) {      for (const part of content.parts) {      // Ejecutar cada tool que Gemini solicitó      const toolResults = [];    if (content.parts.some((part) => 'functionCall' in part)) {    // Si Gemini decidió ejecutar una tool    const content = response.candidates[0].content;    // Procesar la respuesta de Gemini    });      ],        },          functionDeclarations: this.getMCPTools(),        {      tools: [      ],        },          parts: [{ text: userMessage }],          role: 'user',        {      contents: [    const response = await model.generateContent({    // Primera llamada: Gemini analiza el mensaje y decide qué tools usar    const model = this.client.getGenerativeModel({ model: 'gemini-pro' });  async processUserRequest(userMessage: string): Promise<string> {   */   * Gemini decide automáticamente qué tools usar   * Procesa una solicitud de usuario con Gemini  /**  }    }      throw new Error(`Error ejecutando MCP tool ${toolName}: ${error.message}`);    } catch (error: any) {      return response.data.result;      }        );          `MCP Error: ${response.data.error.message}`,        throw new Error(      if (response.data.error) {      });        params,        method: toolName,        id: `${toolName}-${Date.now()}`,        jsonrpc: '2.0',      const response = await axios.post(`${this.mcpServerUrl}/rpc`, {    try {  ): Promise<any> {    params: Record<string, any>,    toolName: string,  private async executeMCPTool(   */   * Ejecuta una tool MCP  /**  }    ];      },        },          required: ['id'],          },            },              description: 'Razón del cambio (opcional)',              type: 'string',            razon: {            },              description: 'ID de la verificación',              type: 'string',            id: {          properties: {          type: 'object',        input_schema: {        description: 'Cambia el estado de una verificación a VERIFICADO',        name: 'cambiar_a_verificado',      {      },        },          required: ['id'],          },            },              description: 'ID de la verificación',              type: 'string',            id: {          properties: {          type: 'object',        input_schema: {        description: 'Valida si una verificación está en estado PENDIENTE',        name: 'es_pendiente',      {      },        },          },            offset: { type: 'number', minimum: 0 },            limit: { type: 'number', minimum: 1, maximum: 100 },            },              enum: ['PENDIENTE', 'VERIFICADO', 'RECHAZADO', 'EN_PROGRESO'],              type: 'string',            estado: {            },              description: 'ID del arquitecto',              type: 'string',            arquitectoId: {            id: { type: 'string', description: 'ID de la verificación' },          properties: {          type: 'object',        input_schema: {          'Busca verificaciones por criterios: ID, arquitecto, estado',        description:        name: 'buscar_verificacion',      {    return [  private getMCPTools() {   */   * Define las tools MCP para Gemini  /**  }    this.mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:9000';    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);  constructor() {  private mcpServerUrl: string;  private client: GoogleGenerativeAI;export class GeminiService {@Injectable()import axios from 'axios';import { GoogleGenerativeAI } from '@google/generative-ai';import { Injectable } from '@nestjs/common';// archivo: api-gateway/src/gemini/gemini.service.ts */ * Ejemplo de cómo integrar en el API Gateway NestJS/**// ============================================================================// 3. CÓDIGO NESTJS PARA API GATEWAY// ============================================================================};  ],    },      },        required: ['id'],        },          },              'Razón o comentario del cambio de estado para auditoría (opcional)',            description:            type: 'string',          razon: {          },            description: 'ID único de la verificación a actualizar',            type: 'string',          id: {        properties: {        type: 'object',      input_schema: {        'Opcionalmente acepta una razón para auditoría.',        'Requiere que la verificación esté en estado PENDIENTE o EN_PROGRESO. ' +        'Cambia el estado de una verificación a VERIFICADO. ' +      description:      name: 'cambiar_a_verificado',    {    },      },        required: ['id'],        },          },            description: 'ID único de la verificación a validar',            type: 'string',          id: {        properties: {        type: 'object',      input_schema: {        'Útil para validaciones y lógica condicional antes de cambios de estado.',        'Verifica rápidamente si una verificación específica está en estado PENDIENTE. ' +      description:      name: 'es_pendiente',    {    },      },        required: [],        },          },            description: 'Número de registros a saltar para paginación (default: 0)',            minimum: 0,            type: 'number',          offset: {          },            description: 'Número máximo de resultados (default: 10)',            maximum: 100,            minimum: 1,            type: 'number',          limit: {          },            description: 'Estado actual de la verificación',            enum: ['PENDIENTE', 'VERIFICADO', 'RECHAZADO', 'EN_PROGRESO'],            type: 'string',          estado: {          },            description: 'ID del arquitecto propietario de la verificación',            type: 'string',          arquitectoId: {          },            description: 'ID único de la verificación (búsqueda exacta)',            type: 'string',          id: {        properties: {        type: 'object',      input_schema: {        'Permite filtrar por ID, arquitecto responsable, estado actual o usar paginación.',        'Busca verificaciones en el sistema según criterios específicos. ' +      description:      name: 'buscar_verificacion',    {  tools: [const MCPToolsDefinition = { */ * Aquí está el esquema de las 3 tools para MCP: * Las tools deben ser definidas en el formato que Gemini espera./**// ============================================================================// 2. DEFINICIÓN DE TOOLS PARA GEMINI// ============================================================================ */ *  * └─────────────────────────────────────────────────────────────┘ * │  • Accede a Base de Datos PostgreSQL                         │ * │  • Microservicio Verificación (API REST)                     │ * │      Backend Microservicios                                  │ * ┌─────────────────────────────────────────────────────────────┐ *                          ▼ *                          │ REST HTTP * └────────────────────────┬────────────────────────────────────┘ * │  • Maneja errores JSON-RPC 2.0                               │ * │  • Valida parámetros contra JSON Schema                      │ * │  • Ejecuta las tools (buscar, validar, cambiar)              │ * │  • Recibe solicitudes JSON-RPC 2.0                           │ * │      MCP Server (Express + JSON-RPC 2.0)                     │ * ┌─────────────────────────────────────────────────────────────┐ *                          ▼ *                          │ JSON-RPC 2.0 * └────────────────────────┬────────────────────────────────────┘ * │  • Ruteá solicitudes al MCP Server                           │ * │  • Define tools MCP disponibles para Gemini                  │ * │  • Integra con Google Generative AI SDK                      │ * │  • Recibe solicitudes HTTP REST                              │ * │         API Gateway (NestJS + Gemini)                        │ * ┌─────────────────────────────────────────────────────────────┐ *                          ▼ *                          │ HTTP Request * └────────────────────────┬────────────────────────────────────┘ * │         "¿Está pendiente la verificación 123?"               │ * │                     USUARIO (Cliente)                        │ * ┌─────────────────────────────────────────────────────────────┐ * /**// ============================================================================// 1. ARQUITECTURA GENERAL// ============================================================================ */ * para que Gemini pueda ejecutar las tools de manera transparente. * Este archivo muestra cómo integrar el MCP Server con el API Gateway NestJS *  * Integración MCP Server con API Gateway * Ejemplo de Integración: API Gateway -> MCP Server -> Backend
 * 
 * Este archivo muestra cómo integrar el MCP Server en el API Gateway (NestJS)
 * para que Gemini pueda usar los tools disponibles.
 * 
 * Ubicación sugerida: api-gateway/src/mcp/mcp.service.ts
 */

import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

/**
 * Interfaz para respuesta del MCP
 */
interface MCPResponse<T> {
  jsonrpc: '2.0';
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number;
}

/**
 * Interfaz para parámetros de búsqueda
 */
interface BuscarVerificacionParams {
  id?: string;
  arquitecto_id?: string;
  estado?: 'pendiente' | 'verificado' | 'rechazado';
}

/**
 * Interfaz para cambio de estado
 */
interface CambiarEstadoParams {
  id: string;
  moderador_id: string;
  razon?: string;
  validar_pendiente?: boolean;
}

/**
 * Servicio para comunicación con MCP Server
 */
@Injectable()
export class MCPService {
  private readonly logger = new Logger(MCPService.name);
  private readonly mcpUrl: string;
  private readonly mcpTimeout: number;

  constructor() {
    this.mcpUrl = process.env.MCP_SERVER_URL || 'http://localhost:3500/rpc';
    this.mcpTimeout = parseInt(process.env.MCP_SERVER_TIMEOUT || '10000', 10);

    this.logger.log(`MCP Server URL: ${this.mcpUrl}`);
    this.logger.log(`MCP Server Timeout: ${this.mcpTimeout}ms`);
  }

  /**
   * Hacer request JSON-RPC al MCP Server
   */
  private async invokeJsonRpc<T>(
    method: string,
    params?: any,
    id: string = `req-${Date.now()}`
  ): Promise<T> {
    const payload = {
      jsonrpc: '2.0',
      method,
      params,
      id,
    };

    try {
      this.logger.debug(`Invoking MCP: ${method}`, { id, params });

      const response = await axios.post<MCPResponse<T>>(this.mcpUrl, payload, {
        timeout: this.mcpTimeout,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Source': 'API-Gateway',
        },
      });

      if (response.data.error) {
        throw new Error(
          `MCP Error (${response.data.error.code}): ${response.data.error.message}`
        );
      }

      this.logger.debug(`MCP Response:`, response.data.result);
      return response.data.result as T;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(`MCP Error: ${axiosError.message}`, {
        method,
        status: axiosError.response?.status,
      });
      throw error;
    }
  }

  /**
   * Obtener lista de tools disponibles
   */
  async listTools(): Promise<string[]> {
    const result = await this.invokeJsonRpc<{
      tools: string[];
      count: number;
    }>('tools.list');

    return result.tools;
  }

  /**
   * Obtener descripción de todos los tools
   */
  async getAllTools(): Promise<any[]> {
    const result = await this.invokeJsonRpc<{
      tools: any[];
      count: number;
    }>('tools.all');

    return result.tools;
  }

  /**
   * Buscar una verificación
   */
  async buscarVerificacion(
    criterios: BuscarVerificacionParams
  ): Promise<{
    found: boolean;
    verificacion: any | null;
    message: string;
  }> {
    return this.invokeJsonRpc(
      'tools.call',
      {
        name: 'buscar_verificacion',
        params: criterios,
      },
      `buscar-${Date.now()}`
    );
  }

  /**
   * Buscar verificación por ID
   */
  async buscarVerificacionPorId(id: string): Promise<any> {
    const result = await this.buscarVerificacion({ id });
    if (!result.found) {
      throw new Error(`Verificación no encontrada: ${id}`);
    }
    return result.verificacion;
  }

  /**
   * Buscar verificaciones por arquitecto
   */
  async buscarVerificacionesPorArquitecto(
    arquitectoId: string
  ): Promise<any[]> {
    const result = await this.buscarVerificacion({ arquitecto_id: arquitectoId });
    return result.found ? [result.verificacion] : [];
  }

  /**
   * Buscar verificaciones por estado
   */
  async buscarVerificacionesPorEstado(
    estado: 'pendiente' | 'verificado' | 'rechazado'
  ): Promise<any[]> {
    const result = await this.buscarVerificacion({ estado });
    return result.found ? [result.verificacion] : [];
  }

  /**
   * Validar si una verificación está pendiente
   */
  async esPendiente(
    verificacionId: string
  ): Promise<{
    esPendiente: boolean;
    estado_actual: string;
    message: string;
  }> {
    const result = await this.invokeJsonRpc(
      'tools.call',
      {
        name: 'es_pendiente',
        params: { id: verificacionId },
      },
      `pending-check-${Date.now()}`
    );

    return {
      esPendiente: result.result.esPendiente === 'true',
      estado_actual: result.result.estado_actual,
      message: result.result.message,
    };
  }

  /**
   * Cambiar verificación a estado verificado
   */
  async cambiarAVerificado(
    params: CambiarEstadoParams
  ): Promise<{
    success: boolean;
    verificacion: any;
    message: string;
  }> {
    return this.invokeJsonRpc(
      'tools.call',
      {
        name: 'cambiar_a_verificado',
        params: {
          id: params.id,
          moderador_id: params.moderador_id,
          razon: params.razon || 'Cambio realizado por API Gateway',
          validar_pendiente: params.validar_pendiente ? 'true' : 'false',
        },
      },
      `state-change-${Date.now()}`
    );
  }

  /**
   * Función genérica para ejecutar cualquier tool
   */
  async executeTool(
    toolName: string,
    params: Record<string, any>
  ): Promise<any> {
    return this.invokeJsonRpc(
      'tools.call',
      {
        name: toolName,
        params,
      },
      `tool-exec-${Date.now()}`
    );
  }
}

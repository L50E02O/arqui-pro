/**
 * Tipos para MCP Protocol (Model Context Protocol)
 * Tipos base para el protocolo JSON-RPC 2.0
 * Implementación de Model Context Protocol (MCP)
 * Basado en JSON-RPC 2.0 con extensiones para tools
 */

/**
 * Definición de un Tool en MCP
 * Cada tool implementa una funcionalidad específica expuesta por el servidor
 */
export interface MCPTool {
  /** Nombre único del tool */
  name: string;

  /** Descripción legible del tool */
  description: string;

  /** Esquema JSON para los parámetros de entrada */
  inputSchema: JSONSchema;

  /** Esquema JSON para la respuesta */
  outputSchema: JSONSchema;

  /** Función ejecutora del tool */
  execute: (params: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

/**
 * Esquema JSON para validación de inputs/outputs
 */
export interface JSONSchema {
  type: string;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  description?: string;
  additionalProperties?: boolean;
}

/**
 * Propiedad individual en un JSON Schema
 */
export interface SchemaProperty {
  type: string;
  description?: string;
  enum?: (string | number)[];
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  properties?: Record<string, SchemaProperty>;
}

/**
 * Solicitud JSON-RPC 2.0
 */
export interface JSONRPCRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id: string | number;
}

/**
 * Respuesta JSON-RPC 2.0 exitosa
 */
export interface JSONRPCSuccessResponse {
  jsonrpc: '2.0';
  result: Record<string, unknown>;
  id: string | number;
}

/**
 * Respuesta JSON-RPC 2.0 con error
 */
export interface JSONRPCErrorResponse {
  jsonrpc: '2.0';
  error: {
    code: number;
    message: string;
    data?: Record<string, unknown>;
  };
  id: string | number;
}

/**
 * Estados posibles de una Verificación
 */
export type VerificacionEstado = 'pendiente' | 'verificado' | 'rechazado';

/**
 * Modelo de Verificación según backend
 */
export interface Verificacion {
  id: string;
  arquitecto_id: string;
  moderador_id: string;
  estado: VerificacionEstado;
  fecha_verificacion: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Modelo de Arquitecto según backend
 */
export interface Arquitecto {
  id: string;
  nombre: string;
  email: string;
  especialidad: string;
  activo: boolean;
  fechaRegistro: string;
}

/**
 * Response del backend para búsqueda de verificación
 */
export interface BuscarVerificacionResponse {
  success: boolean;
  data: Verificacion | null;
  message?: string;
  error?: string;
}

/**
 * Response del backend para cambiar estado
 */
export interface CambiarEstadoResponse {
  success: boolean;
  data: Verificacion;
  message?: string;
  error?: string;
}

/**
 * Response del backend para validación
 */
export interface ValidacionResponse {
  success: boolean;
  data: {
    esPendiente: boolean;
  };
  message?: string;
  error?: string;
}

/**
 * Errores JSON-RPC estándar
 */
export enum JSONRPCErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  SERVER_ERROR = -32000,
  BACKEND_ERROR = -32001,
  VALIDATION_ERROR = -32002,
}

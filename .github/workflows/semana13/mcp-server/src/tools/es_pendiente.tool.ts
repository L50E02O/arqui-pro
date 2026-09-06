/**
 * Tool: es_pendiente
 * 
 * Valida si una verificación está en estado PENDIENTE.
 * Esta es una operación de lectura que NO modifica datos.
 * 
 * Useful casos de uso:
 * - Verificar si una verificación está lista para ser procesada
 * - Validar antes de cambiar a estado "verificado"
 * - Lógica condicional basada en el estado actual
 */

import axios, { AxiosError } from 'axios';
import {
  MCPTool,
  JSONSchema,
  ValidacionResponse,
  JSONRPCErrorCode,
} from '../types/mcp.types.js';

/**
 * Validar UUID
 */
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Esquema JSON de entrada para es_pendiente
 */
const inputSchema: JSONSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      description: 'UUID de la verificación a validar. Ej: 550e8400-e29b-41d4-a716-446655440000',
    },
  },
  required: ['id'],
  description: 'El ID de la verificación es obligatorio',
  additionalProperties: false,
};

/**
 * Esquema JSON de salida para es_pendiente
 */
const outputSchema: JSONSchema = {
  type: 'object',
  properties: {
    esPendiente: {
      type: 'string',
      description: 'true si el estado es "pendiente", false en caso contrario',
    },
    estado_actual: {
      type: 'string',
      description: 'El estado actual de la verificación (pendiente, verificado, rechazado)',
    },
    message: {
      type: 'string',
      description: 'Mensaje descriptivo del resultado',
    },
  },
  required: ['esPendiente', 'estado_actual', 'message'],
  additionalProperties: false,
};

/**
 * Función ejecutora del tool es_pendiente
 */
const execute = async (
  params: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  // Validar que el ID sea proporcionado
  if (!params.id || typeof params.id !== 'string') {
    throw {
      code: JSONRPCErrorCode.VALIDATION_ERROR,
      message: 'El parámetro "id" es requerido y debe ser una cadena (UUID)',
    };
  }

  // Validar formato de UUID
  if (!isValidUUID(params.id)) {
    throw {
      code: JSONRPCErrorCode.VALIDATION_ERROR,
      message: `ID de verificación inválido: "${params.id}". Debe ser un UUID válido`,
    };
  }

  try {
    // Construir URL del backend
    const baseUrl = process.env.VERIFICACION_SERVICE_URL || 'http://localhost:3002';
    const url = `${baseUrl}/api/verificacion/${params.id}`;

    console.log(`[es_pendiente] Obteniendo estado de verificación: ${params.id}`);

    // Realizar solicitud al backend para obtener la verificación
    const timeout = parseInt(process.env.VERIFICACION_SERVICE_TIMEOUT || '5000', 10);
    const response = await axios.get<any>(url, {
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Source': 'MCP-Server',
      },
    });

    // Extraer el estado
    const estadoActual = response.data.data?.estado || response.data.estado;

    if (!estadoActual) {
      throw {
        code: JSONRPCErrorCode.BACKEND_ERROR,
        message: 'No se pudo obtener el estado de la verificación desde el backend',
      };
    }

    // Validar estado
    const estadosValidos = ['pendiente', 'verificado', 'rechazado'];
    if (!estadosValidos.includes(estadoActual)) {
      console.warn(`[es_pendiente] Estado desconocido: ${estadoActual}`);
    }

    // Evaluar si es pendiente
    const esPendiente = estadoActual.toLowerCase() === 'pendiente';

    console.log(
      `[es_pendiente] Resultado - ID: ${params.id}, Estado: ${estadoActual}, EsPendiente: ${esPendiente}`
    );

    return {
      esPendiente: esPendiente.toString(),
      estado_actual: estadoActual,
      message: esPendiente
        ? `La verificación ${params.id} está en estado PENDIENTE`
        : `La verificación ${params.id} NO está en estado PENDIENTE (estado actual: ${estadoActual})`,
    };
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    console.error(`[es_pendiente] Error:`, axiosError.message);

    if (axiosError.response?.status === 404) {
      throw {
        code: JSONRPCErrorCode.BACKEND_ERROR,
        message: `Verificación no encontrada: ${params.id}`,
      };
    }

    if (axiosError.code === 'ECONNREFUSED') {
      throw {
        code: JSONRPCErrorCode.BACKEND_ERROR,
        message: `No se puede conectar al microservicio de verificación en ${process.env.VERIFICACION_SERVICE_URL}`,
      };
    }

    throw {
      code: JSONRPCErrorCode.BACKEND_ERROR,
      message: `Error al validar estado de verificación: ${axiosError.message}`,
      data: { status: axiosError.response?.status, error: axiosError.response?.data?.error },
    };
  }
};

/**
 * Definición completa del Tool es_pendiente
 */
export const esPendienteTool: MCPTool = {
  name: 'es_pendiente',
  description:
    'Valida si una verificación está en estado PENDIENTE. ' +
    'Útil para verificar el estado actual antes de realizar cambios. ' +
    'No modifica datos, solo consulta.',
  inputSchema,
  outputSchema,
  execute,
};

/**
 * Tool: cambiar_a_verificado
 * 
 * Actualiza el estado de una verificación a "verificado".
 * Esta es una operación de ESCRITURA que MODIFICA datos en la BD.
 * 
 * Validaciones:
 * - Verifica que la verificación exista
 * - Verifica que esté en estado "pendiente" antes de cambiar
 * - Registra auditoría de cambios
 * 
 * Casos de uso:
 * - Marcar una verificación como completada
 * - Cambiar estado después de revisión manual
 * - Actualizar estado según reglas de negocio
 */

import axios, { AxiosError } from 'axios';
import {
  MCPTool,
  JSONSchema,
  CambiarEstadoResponse,
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
 * Esquema JSON de entrada para cambiar_a_verificado
 */
const inputSchema: JSONSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      description: 'UUID de la verificación a actualizar. Ej: 550e8400-e29b-41d4-a716-446655440000',
    },
    moderador_id: {
      type: 'string',
      description: 'UUID del moderador que realiza el cambio. Ej: 550e8400-e29b-41d4-a716-446655440000',
    },
    razon: {
      type: 'string',
      description: 'Razón o comentario del cambio de estado (opcional). Ej: "Documentación completa"',
    },
    validar_pendiente: {
      type: 'boolean',
      description: 'DEBE SER true (booleano). Confirma que ya verificaste que está en estado PENDIENTE usando "es_pendiente" primero. OBLIGATORIO por seguridad.',
    },
  },
  required: ['id', 'validar_pendiente'],
  description: 'IMPORTANTE: Debes proporcionar validar_pendiente: true. Primero verifica con "es_pendiente" que está en estado PENDIENTE, LUEGO llama a esta herramienta con validar_pendiente: true',
  additionalProperties: false,
};

/**
 * Esquema JSON de salida para cambiar_a_verificado
 */
const outputSchema: JSONSchema = {
  type: 'object',
  properties: {
    success: {
      type: 'string',
      description: 'true si el cambio fue exitoso, false en caso contrario',
    },
    verificacion: {
      type: 'object',
      description: 'Datos actualizados de la verificación',
      properties: {
        id: { type: 'string' },
        arquitecto_id: { type: 'string' },
        moderador_id: { type: 'string' },
        estado: { type: 'string' },
        fecha_verificacion: { type: 'string' },
        created_at: { type: 'string' },
        updated_at: { type: 'string' },
      },
    },
    message: {
      type: 'string',
      description: 'Mensaje descriptivo del resultado',
    },
  },
  required: ['success', 'message'],
  additionalProperties: false,
};

/**
 * Función ejecutora del tool cambiar_a_verificado
 * 
 * IMPORTANTE: Esta función MODIFICA datos en la base de datos.
 * Se debe usar con cuidado en producción.
 */
const execute = async (
  params: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  // Validación OBLIGATORIA de seguridad
  const validarPendienteValue = params.validar_pendiente;
  if (validarPendienteValue !== true && validarPendienteValue !== 'true') {
    throw {
      code: JSONRPCErrorCode.VALIDATION_ERROR,
      message: 'El parámetro "validar_pendiente" DEBE ser true (booleano). ' +
        'Debes validar primero que la verificación está en estado PENDIENTE usando "es_pendiente" ' +
        'ANTES de cambiarla a verificado. Este parámetro es obligatorio por seguridad. ' +
        'Ejemplo correcto: cambiar_a_verificado(id="...", validar_pendiente=true)',
    };
  }

  // Validaciones de entrada
  if (!params.id || typeof params.id !== 'string') {
    throw {
      code: JSONRPCErrorCode.VALIDATION_ERROR,
      message: 'El parámetro "id" es requerido y debe ser una cadena (UUID)',
    };
  }

  // Validar formato de UUIDs
  if (!isValidUUID(params.id as string)) {
    throw {
      code: JSONRPCErrorCode.VALIDATION_ERROR,
      message: `ID de verificación inválido: "${params.id}". Debe ser un UUID válido`,
    };
  }

  // Verificación de seguridad: siempre valida que esté pendiente
  const validarPendiente = true;

  try {
    const baseUrl = process.env.VERIFICACION_SERVICE_URL || 'http://localhost:3002';
    const timeout = parseInt(process.env.VERIFICACION_SERVICE_TIMEOUT || '5000', 10);

    // Si se solicita validación, obtener estado actual primero
    if (validarPendiente) {
      console.log(`[cambiar_a_verificado] Validando que verificación está en estado pendiente: ${params.id}`);

      try {
        const getUrl = `${baseUrl}/api/verificacion/${params.id}`;
        const getResponse = await axios.get<any>(getUrl, {
          timeout,
          headers: { 'Content-Type': 'application/json', 'X-Request-Source': 'MCP-Server' },
        });

        const estadoActual = getResponse.data.data?.estado || getResponse.data.estado;

        if (estadoActual !== 'pendiente') {
          throw {
            code: JSONRPCErrorCode.VALIDATION_ERROR,
            message: `La verificación no está en estado pendiente. Estado actual: "${estadoActual}". No se puede cambiar a verificado.`,
          };
        }
      } catch (error) {
        const axiosError = error as AxiosError<any>;
        if (axiosError.response?.status === 404) {
          throw {
            code: JSONRPCErrorCode.BACKEND_ERROR,
            message: `Verificación no encontrada: ${params.id}`,
          };
        }
        throw error;
      }
    }

    // Preparar payload para el cambio de estado
    const updatePayload = {
      estado: 'verificado',
      // moderador_id: params.moderador_id,
      razon: params.razon || 'Cambio realizado por MCP Server',
      timestamp: new Date().toISOString(),
    };

    // Realizar solicitud PATCH/PUT al backend
    const updateUrl = `${baseUrl}/api/verificacion/${params.id}`;
    console.log(`[cambiar_a_verificado] Realizando cambio: ${updateUrl}`, updatePayload);

    const updateResponse = await axios.patch<CambiarEstadoResponse>(updateUrl, updatePayload, {
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Source': 'MCP-Server',
        'X-Operation': 'ESTADO_CHANGE',
        // 'X-Moderator-Id': String(params.moderador_id),
      },
    });

    console.log(`[cambiar_a_verificado] Cambio exitoso:`, updateResponse.data);

    return {
      success: 'true',
      verificacion: updateResponse.data.data,
      message: `Verificación ${params.id} cambió a estado VERIFICADO.`,
      // message: `Verificación ${params.id} cambió a estado VERIFICADO. Moderador: ${params.moderador_id}`,
    };
  } catch (error) {
    const axiosError = error as AxiosError<CambiarEstadoResponse>;
    console.error(`[cambiar_a_verificado] Error:`, axiosError.message);

    if (axiosError.response?.status === 404) {
      throw {
        code: JSONRPCErrorCode.BACKEND_ERROR,
        message: `Verificación no encontrada: ${params.id}`,
      };
    }

    if (axiosError.response?.status === 409) {
      throw {
        code: JSONRPCErrorCode.VALIDATION_ERROR,
        message: `Conflicto: ${axiosError.response?.data?.error || 'No se puede cambiar el estado'}`,
      };
    }

    if (axiosError.code === 'ECONNREFUSED') {
      throw {
        code: JSONRPCErrorCode.BACKEND_ERROR,
        message: `No se puede conectar al microservicio de verificación en ${process.env.VERIFICACION_SERVICE_URL}`,
      };
    }

    // Re-lanzar errores de validación que ya fueron procesados
    if ((error as any).code === JSONRPCErrorCode.VALIDATION_ERROR) {
      throw error;
    }

    throw {
      code: JSONRPCErrorCode.BACKEND_ERROR,
      message: `Error al cambiar estado de verificación: ${axiosError.message}`,
      data: {
        status: axiosError.response?.status,
        error: axiosError.response?.data?.error,
        verificacionId: params.id,
      },
    };
  }
};

/**
 * Definición completa del Tool cambiar_a_verificado
 */
export const cambiarAVerificadoTool: MCPTool = {
  name: 'cambiar_a_verificado',
  description:
    'Cambia el estado de una verificación a "verificado". ' +
    'IMPORTANTE - FLUJO OBLIGATORIO: ' +
    '1. Primero usa "es_pendiente" para verificar que la verificación está en estado PENDIENTE. ' +
    '2. Solo después de confirmar que está pendiente, llama a esta herramienta. ' +
    '3. Siempre proporciona validar_pendiente="true" (OBLIGATORIO). ' +
    'Esta herramienta MODIFICA datos en la base de datos. ' +
    'No cambies el estado a verificado si no está pendiente. ' +
    'Ejemplos de flujo correcto: ' +
    'Paso 1: es_pendiente(id) -> confirma que está pendiente ' +
    'Paso 2: cambiar_a_verificado(id, validar_pendiente="true") -> cambia a verificado',
  inputSchema,
  outputSchema,
  execute,
};

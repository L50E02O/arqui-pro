/**
 * Tool: buscar_verificacion
 * 
 * Permite buscar una verificación por diversos criterios:
 * - ID de verificación
 * - ID de arquitecto
 * - Estado (pendiente, verificado, rechazado)
 * 
 * Realiza una consulta al microservicio-verificacion via REST
 * y retorna los datos de la verificación encontrada.
 */

import axios, { AxiosError } from 'axios';
import {
  MCPTool,
  JSONSchema,
  BuscarVerificacionResponse,
  Verificacion,
  JSONRPCErrorCode,
} from '../types/mcp.types.js';

/**
 * Función auxiliar para validar UUID
 */
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Esquema JSON de entrada para buscar_verificacion
 * Define los parámetros aceptados y sus validaciones
 */
const inputSchema: JSONSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      description: 'ID único (UUID) de la verificación. Úsalo cuando quieras buscar una verificación específica. Formato: 550e8400-e29b-41d4-a716-446655440000',
    },
    arquitecto_id: {
      type: 'string',
      description: 'ID único (UUID) del arquitecto cuyas verificaciones quieres buscar. Úsalo para obtener todas las verificaciones asociadas a un arquitecto. Formato: 550e8400-e29b-41d4-a716-446655440000',
    },
    estado: {
      type: 'string',
      description: 'Estado actual de la verificación: "pendiente" (aún no verificada), "verificado" (aprobada), o "rechazado" (denegada)',
      enum: ['pendiente', 'verificado', 'rechazado'],
    },
  },
  required: [],
  description: 'Debes proporcionar al menos uno de estos parámetros: id (para búsqueda exacta), arquitecto_id (para búsqueda por arquitecto), o estado (para filtrar por estado)',
  additionalProperties: false,
};

/**
 * Esquema JSON de salida para buscar_verificacion
 */
const outputSchema: JSONSchema = {
  type: 'object',
  properties: {
    found: {
      type: 'string',
      description: 'Indica si se encontró la verificación: true o false',
    },
    verificacion: {
      type: 'object',
      description: 'Datos de la verificación encontrada',
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
  required: ['found', 'message'],
  additionalProperties: false,
};

/**
 * Función ejecutora del tool buscar_verificacion
 * 
 * Realiza una solicitud GET al backend REST para buscar la verificación
 * según los criterios proporcionados.
 */
const execute = async (
  params: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  // Normalizar nombres de parámetros: aceptar tanto camelCase como snake_case
  const id = params.id;
  const arquitecto_id = params.arquitecto_id || params.arquitectoId;
  const estado = params.estado;

  // Validar que al menos un parámetro sea proporcionado
  if (!id && !arquitecto_id && !estado) {
    throw {
      code: JSONRPCErrorCode.VALIDATION_ERROR,
      message: 'Al menos uno de estos parámetros es requerido: id, arquitecto_id, estado',
    };
  }

  // Validar formato de UUIDs si se proporcionan
  if (id && typeof id === 'string' && !isValidUUID(id)) {
    throw {
      code: JSONRPCErrorCode.VALIDATION_ERROR,
      message: `ID de verificación inválido: "${id}". Debe ser un UUID válido`,
    };
  }

  if (arquitecto_id && typeof arquitecto_id === 'string' && !isValidUUID(arquitecto_id)) {
    throw {
      code: JSONRPCErrorCode.VALIDATION_ERROR,
      message: `ID de arquitecto inválido: "${arquitecto_id}". Debe ser un UUID válido`,
    };
  }

  // Validar y normalizar estado si se proporciona (aceptar mayúsculas y minúsculas)
  const estadosValidos = ['pendiente', 'verificado', 'rechazado'];
  let estadoNormalizado: string | undefined;
  if (estado) {
    estadoNormalizado = String(estado).toLowerCase();
    if (!estadosValidos.includes(estadoNormalizado)) {
      throw {
        code: JSONRPCErrorCode.VALIDATION_ERROR,
        message: `Estado inválido: "${estado}". Valores permitidos: ${estadosValidos.join(', ')}`,
      };
    }
  }

  try {
    // Construir URL del backend
    const baseUrl = process.env.VERIFICACION_SERVICE_URL || 'http://localhost:3002';
    let url = `${baseUrl}/api/verificacion/buscar`;

    // Construir query string con los parámetros
    const queryParams = new URLSearchParams();
    if (id) queryParams.append('id', String(id));
    if (arquitecto_id) queryParams.append('arquitectoId', String(arquitecto_id));
    if (estadoNormalizado) queryParams.append('estado', estadoNormalizado);

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    console.log(`[buscar_verificacion] Realizando GET a: ${url}`);

    // Realizar solicitud al backend
    const timeout = parseInt(process.env.VERIFICACION_SERVICE_TIMEOUT || '5000', 10);
    const response = await axios.get<BuscarVerificacionResponse>(url, {
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Source': 'MCP-Server',
      },
    });

    console.log(`[buscar_verificacion] Respuesta exitosa:`, response.data);

    // Procesar respuesta - el backend ahora devuelve un array directamente
    const data = Array.isArray(response.data) ? response.data : (response.data as any).data || response.data;
    
    if (Array.isArray(data) && data.length > 0) {
      return {
        found: true,
        total: data.length,
        verificaciones: data,
        message: `Se encontraron ${data.length} verificación(es)`,
      };
    } else if (data && !Array.isArray(data) && data.id) {
      return {
        found: true,
        total: 1,
        verificaciones: [data],
        message: `Verificación encontrada: ${data.id}`,
      };
    } else {
      return {
        found: false,
        total: 0,
        verificaciones: [],
        message: 'No se encontraron verificaciones con los criterios proporcionados',
      };
    }
  } catch (error) {
    const axiosError = error as AxiosError<BuscarVerificacionResponse>;
    console.error(`[buscar_verificacion] Error:`, axiosError.message);

    if (axiosError.response?.status === 404) {
      return {
        found: false,
        verificacion: null,
        message: 'Verificación no encontrada',
      };
    }

    if (axiosError.code === 'ECONNREFUSED') {
      throw {
        code: JSONRPCErrorCode.BACKEND_ERROR,
        message: `No se puede conectar al microservicio de verificación en ${process.env.VERIFICACION_SERVICE_URL}. ¿Está el servicio corriendo en Docker?`,
      };
    }

    throw {
      code: JSONRPCErrorCode.BACKEND_ERROR,
      message: `Error al buscar verificación: ${axiosError.message}`,
      data: { status: axiosError.response?.status, error: axiosError.response?.data?.error },
    };
  }
};

/**
 * Definición completa del Tool buscar_verificacion
 */
export const buscarVerificacionTool: MCPTool = {
  name: 'buscar_verificacion',
  description:
    'Busca verificaciones en el sistema. Puedes buscar: ' +
    '1) Por ID de verificación (búsqueda exacta), ' +
    '2) Por ID de arquitecto (obtiene todas las verificaciones de ese arquitecto), ' +
    '3) Por estado (pendiente, verificado o rechazado). ' +
    'Usa esta herramienta para consultar verificaciones en la base de datos. ' +
    'Al menos uno de los parámetros (id, arquitecto_id o estado) debe ser proporcionado.',
  inputSchema,
  outputSchema,
  execute,
};

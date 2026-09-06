/**/**










































































































































































































































































































































































































































































};  requiredEnvVars: REQUIRED_ENV_VARIABLES,  requiredDependencies: REQUIRED_DEPENDENCIES,  executeMCPFunctionCall,  scenarios: GEMINI_EXAMPLE_SCENARIOS,  tools: GEMINI_MCP_TOOLS,export default {// ============================================================================// EXPORT DEFAULT// ============================================================================};  },    example: 'http://localhost:9000',    source: 'Configuración local',    description: 'URL del MCP Server',  'MCP_SERVER_URL': {  },    example: 'gemini-pro',    source: 'Google Generative AI',    description: 'Modelo de Gemini a usar',  'GEMINI_MODEL': {  },    example: 'AIzaSyDxHzQ...',    source: 'https://makersuite.google.com/app/apikey',    description: 'API Key de Google Generative AI',  'GEMINI_API_KEY': {export const REQUIRED_ENV_VARIABLES = {// ============================================================================// VARIABLES DE ENTORNO NECESARIAS// ============================================================================};  yarn: `yarn add @google/generative-ai axios`,  npm: `npm install @google/generative-ai axios`,export const INSTALLATION_COMMANDS = {};  yarn: ['yarn add @google/generative-ai axios'],  ],    '@nestjs/core',            // NestJS    '@nestjs/common',          // NestJS    'axios',                   // HTTP client    '@google/generative-ai',  // Google Generative AI SDK  npm: [export const REQUIRED_DEPENDENCIES = {// ============================================================================// INSTALACIÓN DE DEPENDENCIAS NECESARIAS// ============================================================================ */ *    { "response": "La verificación verify-001 está en estado PENDIENTE..." } * 8. API Gateway retorna respuesta al usuario *  *    "La verificación verify-001 está en estado PENDIENTE..." * 7. Gemini genera respuesta final en lenguaje natural *  *    }); *      ] *        { role: 'user', parts: toolResults } *        { role: 'model', parts: content.parts }, *        { role: 'user', parts: [...] }, *      contents: [ *    const finalResponse = await model.generateContent({ * 6. API Gateway envía resultados de vuelta a Gemini *  *    } *      } *        toolResults.push({ functionResponse: { name, response: result } }); *        const result = await executeMCPFunctionCall(part.functionCall); *      if ('functionCall' in part) { *    for (const part of content.parts) { * 5. API Gateway ejecuta cada function call *  *    response.candidates[0].content.parts contiene functionCall * 4. Gemini retorna function calls al API Gateway *  *    Gemini detecta que necesita "es_pendiente" con id="verify-001" * 3. Gemini analiza la solicitud y decide qué tools usar *  *    }); *      tools: [{ functionDeclarations: GEMINI_MCP_TOOLS }] *      contents: [...], *    const response = await model.generateContent({ *    const model = client.getGenerativeModel({ model: 'gemini-pro' }); * 2. API Gateway crea cliente Gemini y envía solicitud *  *    { "message": "¿Está pendiente verify-001?" } *    POST /api/gemini/ask * 1. Usuario envía solicitud HTTP al API Gateway *  * Flujo típico de integración en API Gateway:/**// ============================================================================// FLUJO DE INTEGRACIÓN CON GEMINI (PSEUDOCÓDIGO)// ============================================================================}  }    throw error;    console.error(`Error ejecutando MCP function: ${error.message}`);  } catch (error: any) {    return response.data.result;    }      throw new Error(`MCP Error: ${response.data.error.message}`);    if (response.data.error) {    });      params: functionCall.args || {},      method: functionCall.name,      id: `${functionCall.name}-${Date.now()}`,      jsonrpc: '2.0',    const response = await axios.post(`${mcpServerUrl}/rpc`, {  try {  const axios = require('axios');): Promise<any> {  mcpServerUrl: string = 'http://localhost:9000',  },    args?: Record<string, any>;    name: string;  functionCall: {export async function executeMCPFunctionCall( */ * @returns Respuesta del MCP Server * @param mcpServerUrl - URL del MCP Server * @param functionCall - Function call object de Gemini *  * Ejecuta una function call de Gemini contra el MCP Server/**// ============================================================================// FUNCIÓN PARA EXECUTE FUNCTION CALL// ============================================================================};  },      'No puedo cambiar esa verificación. Ya está en estado VERIFICADO, lo que significa que ya fue procesada anteriormente.',    geminiResponse:    },      timestamp: '2024-01-15T10:20:00Z',      },        mensaje: 'La verificación verify-999 está en estado VERIFICADO (no pendiente)',        estadoActual: 'VERIFICADO',        esPendiente: false,        id: 'verify-999',      data: {      success: true,    expectedResponse: {    },      },        id: 'verify-999',      params: {      reason: 'Verificar si está en estado pendiente',      tool: 'es_pendiente',    geminiDecision: {      '¿Puedo cambiar la verificación verify-999 a verificado?',    userMessage:  scenario4: {   */   * Escenario 4: Usuario intenta cambiar una ya verificada  /**  },      'El arquitecto arch-456 tiene 1 verificación pendiente: "Documentación A" creada el 15 de enero.',    geminiResponse:    },      timestamp: '2024-01-15T10:15:00Z',      ],        },          fechaActualizacion: '2024-01-15T08:00:00Z',          fechaCreacion: '2024-01-15T08:00:00Z',          descripcion: 'Documentación A',          estado: 'PENDIENTE',          arquitectoId: 'arch-456',          id: 'verify-001',        {      data: [      success: true,    expectedResponse: {    },      },        estado: 'PENDIENTE',        arquitectoId: 'arch-456',      params: {      reason: 'Filtrar verificaciones pendientes de un arquitecto específico',      tool: 'buscar_verificacion',    geminiDecision: {      '¿Qué verificaciones tiene pendientes el arquitecto arch-456?',    userMessage:  scenario3: {   */   * Escenario 3: Usuario busca de un arquitecto específico  /**  },      'La verificación verify-001 ha sido marcada como verificada exitosamente. Se registró la razón "Fue aprobada después de revisión" para auditoría.',    geminiResponse:    ],      },        timestamp: '2024-01-15T10:06:00Z',        },          fechaActualizacion: '2024-01-15T10:06:00Z',          razon: 'Fue aprobada después de revisión',          estadoAnterior: 'PENDIENTE',          estado: 'VERIFICADO',          arquitectoId: 'arch-456',          id: 'verify-001',        data: {        success: true,        // Respuesta del step 2      {      },        timestamp: '2024-01-15T10:05:00Z',        },          mensaje: 'La verificación verify-001 está en estado PENDIENTE y lista para ser procesada',          estadoActual: 'PENDIENTE',          esPendiente: true,          id: 'verify-001',        data: {        success: true,        // Respuesta del step 1      {    expectedResponses: [    ],      },        },          razon: 'Fue aprobada después de revisión',          id: 'verify-001',        params: {        condition: 'Solo si respuesta del paso 1 es esPendiente=true',        reason: 'Si está pendiente, cambiar a verificado',        tool: 'cambiar_a_verificado',        step: 2,      {      },        },          id: 'verify-001',        params: {        reason: 'Validar que esté pendiente antes de cambiar',        tool: 'es_pendiente',        step: 1,      {    geminiDecision: [      'Marca la verificación verify-001 como verificada, fue aprobada después de revisión',    userMessage:  scenario2: {   */   * Escenario 2: Usuario quiere cambiar una verificación  /**  },      'Hay 2 verificaciones pendientes en el sistema. Una del arquitecto arch-456 y otra del arch-789.',    geminiResponse:    },      timestamp: '2024-01-15T10:00:00Z',      ],        },          fechaActualizacion: '2024-01-15T09:30:00Z',          fechaCreacion: '2024-01-15T09:30:00Z',          descripcion: 'Verificación de documento Y',          estado: 'PENDIENTE',          arquitectoId: 'arch-789',          id: 'verify-002',        {        },          fechaActualizacion: '2024-01-15T08:00:00Z',          fechaCreacion: '2024-01-15T08:00:00Z',          descripcion: 'Verificación de documento X',          estado: 'PENDIENTE',          arquitectoId: 'arch-456',          id: 'verify-001',        {      data: [      success: true,    expectedResponse: {    },      },        estado: 'PENDIENTE',      params: {      reason: 'Usuario pregunta por verificaciones pendientes',      tool: 'buscar_verificacion',    geminiDecision: {      '¿Cuántas verificaciones pendientes hay en el sistema?',    userMessage:  scenario1: {   */   * Escenario 1: Usuario pregunta por verificaciones pendientes  /**export const GEMINI_EXAMPLE_SCENARIOS = {// ============================================================================// EJEMPLOS DE SOLICITUDES Y RESPUESTAS// ============================================================================}  timestamp: string;  error?: string;  };    fechaActualizacion: string;    razon: string;    estadoAnterior: string;    estado: string;    arquitectoId: string;    id: string;  data?: {  success: boolean;export interface CambiarAVerificadoResponse {}  timestamp: string;  error?: string;  };    mensaje: string;    estadoActual: string;    esPendiente: boolean;    id: string;  data?: {  success: boolean;export interface EsPendienteResponse {}  timestamp: string;  error?: string;  data?: VerificacionResponse[];  success: boolean;export interface BuscarVerificacionResponse {}  detalles?: Record<string, any>;  fechaActualizacion: string;  fechaCreacion: string;  descripcion: string;  estado: 'PENDIENTE' | 'VERIFICADO' | 'RECHAZADO' | 'EN_PROGRESO';  arquitectoId: string;  id: string;export interface VerificacionResponse {// ============================================================================// TIPOS DE DATOS PARA RESPUESTAS// ============================================================================];  },    },      required: ['id'],      },        },            'Ejemplo: "Documentación validada correctamente".',            'Opcional. Registra quién y por qué cambió el estado. ' +            'Razón o comentario del cambio de estado para auditoría. ' +          description:          type: 'string',        razon: {        },            'Requerido. Debe existir en el sistema.',            'ID único de la verificación a actualizar. ' +          description:          type: 'string',        id: {      properties: {      type: 'object',    input_schema: {      'Retorna la verificación actualizada.',      'Opcionalmente acepta una razón para auditoría y trazabilidad. ' +      'Requiere que esté en estado PENDIENTE o EN_PROGRESO. ' +      'Cambia el estado de una verificación a VERIFICADO. ' +    description:    name: 'cambiar_a_verificado',  {  },    },      required: ['id'],      },        },            'Requerido. Ejemplo: "verify-123".',            'ID único de la verificación a validar. ' +          description:          type: 'string',        id: {      properties: {      type: 'object',    input_schema: {      'Retorna un booleano y el estado actual. Úsalo para validaciones antes de cambios de estado.',      'Verifica rápidamente si una verificación específica está en estado PENDIENTE. ' +    description:    name: 'es_pendiente',  {  },    },      required: [],      },        },            'Ejemplo: offset=10, limit=10 → resultados 10-20.',            'Default: 0. Usa con limit para paginar. ' +            'Número de registros a saltar. ' +          description:          minimum: 0,          type: 'number',        offset: {        },            'Rango: 1-100. Default: 10. Útil para paginación.',            'Número máximo de resultados a retornar. ' +          description:          maximum: 100,          minimum: 1,          type: 'number',        limit: {        },            'RECHAZADO (no aprobado), EN_PROGRESO (siendo procesado).',            'Usa: PENDIENTE (sin procesar), VERIFICADO (aprobado), ' +            'Estado actual de la verificación. ' +          description:          enum: ['PENDIENTE', 'VERIFICADO', 'RECHAZADO', 'EN_PROGRESO'],          type: 'string',        estado: {        },            'Permite filtrar verificaciones por responsable.',            'ID del arquitecto propietario de la verificación. ' +          description:          type: 'string',        arquitectoId: {        },            'Si se proporciona, ignora otros criterios.',            'ID único de la verificación para búsqueda exacta. ' +          description:          type: 'string',        id: {      properties: {      type: 'object',    input_schema: {      'y soporta paginación. Retorna una lista de verificaciones que coinciden con los criterios.',      'Permite filtrar por ID único, arquitecto responsable, estado actual (PENDIENTE, VERIFICADO, RECHAZADO, EN_PROGRESO), ' +      'Busca verificaciones en el sistema según criterios específicos. ' +    description:    name: 'buscar_verificacion',  {export const GEMINI_MCP_TOOLS = [ */ * Compatible con Google Generative AI SDK v0.1.0+ * Esquema de Tools a exponer a Gemini/**// ============================================================================// DEFINICIONES DE TOOLS PARA GEMINI// ============================================================================ */ * Copiar estas funciones al API Gateway cuando sea necesario * Este archivo contiene las definiciones de tools para Gemini Function Calling *  * Funciones para Gemini Integration * Definición de Funciones para Gemini Function Calling
 * 
 * Este archivo contiene las definiciones de funciones que Gemini
 * puede usar en el contexto del API Gateway.
 * 
 * Ubicación sugerida: api-gateway/src/mcp/gemini-functions.ts
 */

/**
 * Función Gemini: Buscar Verificación
 * 
 * Permite a Gemini buscar una verificación por diferentes criterios
 */
export const buscarVerificacionFunction = {
  name: 'buscar_verificacion',
  description:
    'Busca una verificación en el sistema según criterios (ID, arquitecto_id o estado). ' +
    'Puede buscar por ID de verificación, ID del arquitecto, o estado actual. ' +
    'Retorna los datos completos de la verificación si existe.',
  parameters: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description:
          'UUID de la verificación a buscar. Formato: 550e8400-e29b-41d4-a716-446655440000',
      },
      arquitecto_id: {
        type: 'string',
        description: 'UUID del arquitecto cuya verificación se busca',
      },
      estado: {
        type: 'string',
        enum: ['pendiente', 'verificado', 'rechazado'],
        description: 'Estado de la verificación a filtrar',
      },
    },
    required: [],
  },
};

/**
 * Función Gemini: Validar Estado Pendiente
 * 
 * Permite a Gemini verificar si una verificación está en estado pendiente
 */
export const esPendienteFunction = {
  name: 'es_pendiente',
  description:
    'Valida si una verificación está actualmente en estado PENDIENTE. ' +
    'Retorna el estado actual y un booleano indicando si está pendiente. ' +
    'Útil para verificar si una verificación está lista para ser procesada.',
  parameters: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description:
          'UUID de la verificación a validar. Formato: 550e8400-e29b-41d4-a716-446655440000',
      },
    },
    required: ['id'],
  },
};

/**
 * Función Gemini: Cambiar a Verificado
 * 
 * Permite a Gemini cambiar el estado de una verificación a verificado
 * NOTA: Esta es una operación de ESCRITURA que modifica la base de datos
 */
export const cambiarAVerificadoFunction = {
  name: 'cambiar_a_verificado',
  description:
    'Cambia el estado de una verificación a VERIFICADO. ' +
    'IMPORTANTE: Esta es una operación de ESCRITURA que modifica la base de datos. ' +
    'Puede validar que esté en estado pendiente antes de cambiar (recomendado). ' +
    'Retorna la verificación actualizada con auditoría del cambio.',
  parameters: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description:
          'UUID de la verificación a actualizar. Formato: 550e8400-e29b-41d4-a716-446655440000',
      },
      moderador_id: {
        type: 'string',
        description:
          'UUID del moderador que realiza el cambio. Se registra para auditoría. ' +
          'Formato: 550e8400-e29b-41d4-a716-446655440000',
      },
      razon: {
        type: 'string',
        description:
          'Razón o comentario del cambio. Ej: "Documentación verificada", "Cumple requisitos"',
      },
      validar_pendiente: {
        type: 'boolean',
        description:
          'Si es true, valida que esté en estado pendiente antes de cambiar. ' +
          'Se recomienda true para evitar cambios accidentales.',
      },
    },
    required: ['id', 'moderador_id'],
  },
};

/**
 * Función Gemini: Listar Tools MCP Disponibles
 * 
 * Permite a Gemini consultar qué tools están disponibles en el MCP Server
 */
export const listarToolsFunction = {
  name: 'listar_tools_mcp',
  description:
    'Lista todos los tools disponibles en el MCP Server. ' +
    'Útil para consultar qué operaciones se pueden realizar en el sistema de verificaciones.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

/**
 * Conjunto de todas las funciones para Gemini
 */
export const GEMINI_TOOLS = [
  buscarVerificacionFunction,
  esPendienteFunction,
  cambiarAVerificadoFunction,
  listarToolsFunction,
];

/**
 * Mapeo de función Gemini -> Servicio MCP
 */
export const FUNCTION_HANDLERS = {
  buscar_verificacion: (service, params) =>
    service.buscarVerificacion(params),

  es_pendiente: (service, params) =>
    service.esPendiente(params.id),

  cambiar_a_verificado: (service, params) =>
    service.cambiarAVerificado(params),

  listar_tools_mcp: (service) =>
    service.listTools(),
};

/**
 * Ejemplo de uso en un controlador de API Gateway
 * 
 * @Controller('verificaciones')
 * export class VerificacionesController {
 *   constructor(
 *     private mcpService: MCPService,
 *     private geminiService: GeminiService
 *   ) {}
 *
 *   @Post('search-with-gemini')
 *   async searchWithGemini(@Body() body: { query: string }) {
 *     // 1. Enviar query a Gemini con los tools disponibles
 *     const response = await this.geminiService.generateContent({
 *       contents: [
 *         {
 *           parts: [{ text: body.query }],
 *         },
 *       ],
 *       tools: [{ functionDeclarations: GEMINI_TOOLS }],
 *     });
 *
 *     // 2. Procesar respuesta y ejecutar función si es necesaria
 *     const toolCall = response.candidates[0].content.parts[0];
 *
 *     if (toolCall.functionCall) {
 *       const handler = FUNCTION_HANDLERS[toolCall.functionCall.name];
 *       const result = await handler(this.mcpService, toolCall.functionCall.args);
 *
 *       // 3. Enviar resultado a Gemini para que genere respuesta final
 *       const finalResponse = await this.geminiService.generateContent({
 *         contents: [
 *           {
 *             parts: [{ text: body.query }],
 *           },
 *           {
 *             parts: [
 *               {
 *                 functionCall: toolCall.functionCall,
 *               },
 *             ],
 *           },
 *           {
 *             parts: [
 *               {
 *                 functionResult: {
 *                   name: toolCall.functionCall.name,
 *                   response: result,
 *                 },
 *               },
 *             ],
 *           },
 *         ],
 *         tools: [{ functionDeclarations: GEMINI_TOOLS }],
 *       });
 *
 *       return {
 *         query: body.query,
 *         tool_used: toolCall.functionCall.name,
 *         tool_result: result,
 *         gemini_response: finalResponse.candidates[0].content.parts[0].text,
 *       };
 *     }
 *
 *     return {
 *       query: body.query,
 *       gemini_response: toolCall.text,
 *     };
 *   }
 * }
 */

/**
 * Ejemplo de prompts para Gemini
 */
export const EXAMPLE_PROMPTS = {
  buscar: {
    prompt:
      '¿Me puedes buscar la verificación con ID 550e8400-e29b-41d4-a716-446655440000?',
    expectedTool: 'buscar_verificacion',
    expectedParams: {
      id: '550e8400-e29b-41d4-a716-446655440000',
    },
  },

  estado: {
    prompt:
      '¿La verificación 550e8400-e29b-41d4-a716-446655440000 está pendiente?',
    expectedTool: 'es_pendiente',
    expectedParams: {
      id: '550e8400-e29b-41d4-a716-446655440000',
    },
  },

  cambiar: {
    prompt:
      'Necesito cambiar la verificación 550e8400-e29b-41d4-a716-446655440000 a verificado. ' +
      'El moderador es 880e8400-e29b-41d4-a716-446655440003.',
    expectedTool: 'cambiar_a_verificado',
    expectedParams: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      moderador_id: '880e8400-e29b-41d4-a716-446655440003',
      validar_pendiente: true,
    },
  },

  listar: {
    prompt: '¿Qué operaciones puedo hacer en el sistema de verificaciones?',
    expectedTool: 'listar_tools_mcp',
    expectedParams: {},
  },
};

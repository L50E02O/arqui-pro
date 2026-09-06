# Gemini Integration Guide

## Overview
Esta integración conecta el API Gateway (NestJS) con Google Generative AI (Gemini) para procesar solicitudes de usuarios y ejecutar herramientas disponibles del MCP Server.

## Architecture

```
┌─────────────────┐
│  User Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│   GeminiController              │
│   POST /api/gemini/ask          │
│   GET  /api/gemini/health       │
│   GET  /api/gemini/tools        │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   GeminiService                 │
│   - initializeMCPTools()        │
│   - processUserRequest()        │
│   - executeMCPTool()            │
│   - healthCheck()               │
└────────┬────────────────────────┘
         │
         ├──────────────────────┬──────────────────────┐
         │                      │                      │
         ▼                      ▼                      ▼
    ┌────────────┐         ┌──────────┐         ┌───────────────┐
    │   Gemini   │         │   MCP    │         │  Verification│
    │    API     │         │  Server  │         │  Microservice │
    │            │         │  (port   │         │  (port 3001)  │
    │            │         │   9000)  │         │               │
    └────────────┘         └──────────┘         └───────────────┘
```

## Configuration

### 1. Crear archivo `.env` basado en `.env.example`:

```bash
cp api-gateway/.env.example api-gateway/.env
```

### 2. Configurar variables:

```env
# REQUERIDO: Obtén esto de https://aistudio.google.com/
GEMINI_API_KEY=your-actual-gemini-api-key

# Ubicación del MCP Server (por defecto en local)
MCP_SERVER_URL=http://localhost:9000

# Puerto del API Gateway
PORT=3000

# Entorno
NODE_ENV=development
```

## Installation

```bash
# 1. Instalar dependencias
cd api-gateway
npm install

# 2. Configurar .env
cp .env.example .env
# Editar .env con tu GEMINI_API_KEY

# 3. Iniciar MCP Server (en otra terminal)
cd ../mcp-server
npm install
npm run start

# 4. Iniciar API Gateway
cd ../api-gateway
npm run start
```

## Available Tools

El GeminiService tiene acceso a 3 herramientas del MCP Server:

### 1. `buscar_verificacion`
- **Descripción**: Busca verificaciones por criterios específicos
- **Parámetros**:
  - `estado` (string): Estado de la verificación
  - `arquitecto_id` (number, opcional): ID del arquitecto
  - `limite` (number, opcional): Límite de resultados (default: 10)

### 2. `es_pendiente`
- **Descripción**: Verifica si una verificación está pendiente
- **Parámetros**:
  - `verificacion_id` (number): ID de la verificación

### 3. `cambiar_a_verificado`
- **Descripción**: Cambia el estado de una verificación a verificado
- **Parámetros**:
  - `verificacion_id` (number): ID de la verificación
  - `comentario` (string, opcional): Comentario de verificación

## API Endpoints

### 1. Process User Message

**POST** `/api/gemini/ask`

Procesa una solicitud de usuario usando Gemini. Gemini decide qué tools utilizar.

**Request:**
```json
{
  "message": "¿Cuántas verificaciones pendientes hay para el arquitecto 1?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Encontré 3 verificaciones pendientes para el arquitecto 1: [listado detallado]",
  "toolsUsed": ["buscar_verificacion"],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Status Codes:**
- `200 OK`: Solicitud procesada exitosamente
- `500 Internal Server Error`: Error procesando con Gemini o MCP Server

### 2. Health Check

**GET** `/api/gemini/health`

Verifica el estado de Gemini y MCP Server

**Response:**
```json
{
  "success": true,
  "gemini": true,
  "mcpServer": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Status Codes:**
- `200 OK`: Ambos servicios están disponibles
- `500 Internal Server Error`: Uno o ambos servicios no responden

### 3. List Available Tools

**GET** `/api/gemini/tools`

Lista todas las tools disponibles que Gemini puede utilizar

**Response:**
```json
{
  "success": true,
  "count": 3,
  "tools": [
    {
      "name": "buscar_verificacion",
      "description": "Busca verificaciones por criterios específicos",
      "input_schema": { ... }
    },
    ...
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 4. Test Endpoint

**POST** `/api/gemini/test`

Endpoint de prueba para validar la integración sin afectar datos reales

**Request:**
```json
{
  "message": "Hola, ¿puedes decirme cuántas verificaciones hay?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "[TEST] Respuesta: ...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## How It Works

### Two-Phase Processing

El GeminiService implementa un patrón de dos fases:

#### Phase 1: Analysis & Decision
```
User Message
    ↓
Gemini receives message + tool definitions
    ↓
Gemini decides which tools to use
    ↓
Returns functionCalls with tool names and parameters
```

#### Phase 2: Tool Execution & Response
```
functionCalls from Phase 1
    ↓
For each functionCall:
  - Extract tool name and parameters
  - Make HTTP POST to MCP Server /rpc
  - Get tool execution result
    ↓
Compile all tool results
    ↓
Send Phase 2 prompt to Gemini with tool results
    ↓
Gemini generates natural language response
    ↓
Return response to user
```

### MCP Tool Integration

Cada tool se define con:
- **name**: Identificador único
- **description**: Descripción en lenguaje natural
- **input_schema**: JSON Schema que describe parámetros
- **execution**: HTTP POST a `{MCP_SERVER_URL}/rpc`

```typescript
{
  name: "buscar_verificacion",
  description: "Busca verificaciones por criterios específicos...",
  input_schema: {
    type: "object",
    properties: {
      estado: { type: "string" },
      arquitecto_id: { type: "number" },
      limite: { type: "number" }
    },
    required: ["estado"]
  }
}
```

## Testing

### 1. Verificar conexión con Gemini y MCP Server

```bash
curl -X GET http://localhost:3000/api/gemini/health
```

Esperado:
```json
{
  "success": true,
  "gemini": true,
  "mcpServer": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Listar tools disponibles

```bash
curl -X GET http://localhost:3000/api/gemini/tools
```

### 3. Ejecutar prueba simple

```bash
curl -X POST http://localhost:3000/api/gemini/test \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Hola?"}'
```

### 4. Ejecutar solicitud real

```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuántas verificaciones pendientes hay?"}'
```

## Error Handling

### Errores Comunes

#### 1. GEMINI_API_KEY no configurada
```
Error: GEMINI_API_KEY no encontrada en variables de entorno
```
**Solución**: Configurar `GEMINI_API_KEY` en `.env`

#### 2. MCP Server no disponible
```
Error: No se pudo conectar con MCP Server en http://localhost:9000
```
**Solución**: 
- Verificar que MCP Server está iniciado
- Verificar que MCP_SERVER_URL es correcto

#### 3. Tool no existe
```
Error: Tool 'nombre_tool' no encontrada
```
**Solución**: Verificar que el nombre de la tool es exacto

### Debugging

El GeminiService incluye logging comprehensivo:

```typescript
// En gemini.service.ts
this.logger.debug('[initializeMCPTools] Inicializando tools...');
this.logger.log('[processUserRequest] Procesando solicitud...');
this.logger.error('[executeMCPTool] Error ejecutando tool:', error);
```

**Habilitar debug mode** (en ambiente local):

```env
DEBUG=api-gateway:*
NODE_ENV=development
```

## Performance Considerations

### Timeouts
- Gemini API: 30 segundos (timeout default de axios)
- MCP Server: 15 segundos por tool

### Rate Limiting
- Gemini: Depende del plan (free: ~15 req/min)
- MCP Server: Sin límite (local)

### Caching
Actualmente sin caché. Implementar si es necesario:

```typescript
// Pseudocódigo para caché futura
cache.set(`gemini:${userMessage}`, response, TTL_SECONDS);
```

## Integration Examples

### Example 1: Query Verificaciones

```javascript
const response = await fetch('http://localhost:3000/api/gemini/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Necesito ver todas las verificaciones en estado PENDIENTE'
  })
});

const data = await response.json();
console.log(data.response); // Gemini's natural language response
```

### Example 2: Check Verificación Status

```javascript
const response = await fetch('http://localhost:3000/api/gemini/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '¿Está pendiente la verificación ID 42?'
  })
});

const data = await response.json();
console.log(data.response); // Gemini decides to use es_pendiente tool
```

### Example 3: Update Verificación

```javascript
const response = await fetch('http://localhost:3000/api/gemini/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Marca la verificación 123 como verificada con comentario: Cumple especificaciones'
  })
});

const data = await response.json();
console.log(data.response); // Gemini decides to use cambiar_a_verificado tool
```

## Architecture Decision Records (ADR)

### ADR-001: Two-Phase Gemini Processing

**Decision**: Implementar patrón de dos fases (analysis + execution)

**Rationale**:
- Fase 1 permite a Gemini elegir tools dinámicamente
- Fase 2 permite usar resultados en respuesta natural
- Mejor separación de concerns

**Alternatives**: 
- Single-phase: Gemini + tool execution en una sola llamada (más simple pero menos flexible)

### ADR-002: HTTP-based MCP Communication

**Decision**: Usar HTTP POST a /rpc para ejecutar MCP tools

**Rationale**:
- Desacoplamiento entre API Gateway y MCP Server
- MCP Server puede escalarse independientemente
- Facilita debugging y monitoring

**Alternatives**:
- Direct in-process calls (más rápido pero acoplado)
- WebSocket (más complejo)

## Future Enhancements

- [ ] Implementar caché de respuestas
- [ ] Agregar rate limiting
- [ ] Implementar async tool execution
- [ ] Agregar streaming de respuestas
- [ ] Implementar retry logic con backoff
- [ ] Agregar métricas y monitoreo
- [ ] Implementar WebSocket para respuestas en tiempo real

## Support

Para problemas o preguntas:
1. Verificar logs del API Gateway: `NODE_ENV=development npm run start`
2. Verificar logs del MCP Server: `npm run start` en mcp-server
3. Validar configuración de .env
4. Ejecutar health check endpoint

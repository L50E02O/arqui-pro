# MCP Server - Verificación 🚀# MCP Server - Documentación Completa
















































































































































































































































































































































































































































































































































































































Para más información, consulta la documentación en [semana13/README.md](../README.md)**Última actualización**: 2024-01-15---MCP Server para proyecto de Semana 13## ✍️ AutorUNLICENSED## 📝 Licencia4. Documentar en ejemplos3. Registrar en `src/tools/registry.ts`2. Implementar `MCPTool` interface1. Crear archivo en `src/tools/[nombre].tool.ts`Para agregar nuevas tools:## 🤝 Contribuir- [examples.js](./examples.js) - Ejemplos Node.js- [examples.ps1](./examples.ps1) - Ejemplos PowerShell- [examples.sh](./examples.sh) - Ejemplos Bash/cURL- [API_GATEWAY_INTEGRATION.ts](./API_GATEWAY_INTEGRATION.ts) - Integración con Gemini- [QUICKSTART.md](./QUICKSTART.md) - Guía de inicio rápido## 📚 Documentación Adicional```kill -9 <PID>lsof -i :9000# O matar proceso que usa puerto 9000MCP_SERVER_PORT=9001# Cambiar puerto en .env```bash**Solución**:**Síntoma**: `Error: listen EADDRINUSE :::9000`### Puerto ocupado4. Consulta ejemplos: [QUICKSTART.md](./QUICKSTART.md)3. Verifica campos requeridos2. Valida tipos de datos1. Revisa JSON Schema para esa tool**Solución**:**Síntoma**: `"error": {"code": -32602}`### Error: "Parámetros inválidos"3. Valida que sea exactamente: `buscar_verificacion`, `es_pendiente`, `cambiar_a_verificado`2. Consulta tools disponibles: `curl http://localhost:9000/tools`1. Revisa el nombre de la tool (case-sensitive)**Solución**:**Síntoma**: `"error": {"code": -32601, "message": "Tool no encontrada"}`### Error: "Tool no encontrada"3. Verifica conectividad: `curl http://localhost:3001/health`2. Revisa variable `BACKEND_BASE_URL` en `.env`1. Verifica que el backend esté corriendo en puerto 3001**Solución**:**Síntoma**: `"Backend status": "unreachable"`### Error: "Backend unreachable"## ❓ Troubleshooting```curl http://localhost:9000/health | jq .```bash### Health check con detallesLuego en Chrome: `chrome://inspect````node --inspect src/server.ts```bash### Conectar debugger```npm run dev 2>&1 | grep -E "\[|ERROR|WARN"```bash### Ver todos los logs```NODE_ENV=development```En `.env`:### Habilitar logs detallados## 🔍 Debugging```}  }    "data": { /* datos adicionales */ }    "message": "Descripción del error",    "code": -32600,  "error": {  "id": "string|number",  "jsonrpc": "2.0",{```json**Error**:```}  }    "timestamp": "ISO 8601 string"    "data": { /* datos específicos */ },    "success": true,  "result": {  "id": "string|number",  "jsonrpc": "2.0",{```json**Éxito**:### Formato de Respuesta| -32603 | Internal error | Error interno || -32602 | Invalid params | Parámetros inválidos || -32601 | Method not found | Tool no encontrada || -32600 | Invalid Request | Request inválido || -32700 | Parse error | Error parseando JSON ||--------|---------|-------------|| Código | Mensaje | Descripción |### Códigos de Error JSON-RPC 2.0| GET | `/` | Información general || GET | `/health` | Health check del servidor || GET | `/tools` | Listar tools disponibles || POST | `/rpc` | Ejecutar JSON-RPC 2.0 ||--------|------|-------------|| Método | Path | Descripción |### Endpoints## 📡 API Reference```  }'    }      "razon": "Aprobado exitosamente"      "id": "verify-456",    "params": {    "method": "cambiar_a_verificado",    "id": "3",    "jsonrpc": "2.0",  -d '{  -H "Content-Type: application/json" \curl -X POST http://localhost:9000/rpc \```bash#### Cambiar a verificado```  }'    }      "id": "verify-123"    "params": {    "method": "es_pendiente",    "id": "2",    "jsonrpc": "2.0",  -d '{  -H "Content-Type: application/json" \curl -X POST http://localhost:9000/rpc \```bash#### Validar si una verificación es pendiente```  }'    }      "estado": "PENDIENTE"    "params": {    "method": "buscar_verificacion",    "id": "1",    "jsonrpc": "2.0",  -d '{  -H "Content-Type: application/json" \curl -X POST http://localhost:9000/rpc \```bash#### Buscar todas las verificaciones pendientes### Ejemplos manuales con cURL```node examples.js```bash**Node.js**:```.\examples.ps1```powershell**PowerShell/Windows**:```./examples.shchmod +x examples.sh```bash**Bash/Linux/Mac**:### Ejecutar ejemplos completos## 📚 Ejemplos```// Gemini ejecuta automáticamente las que necesita];  // ... más tools  },    input_schema: { /* ... */ }    description: 'Busca verificaciones por criterios',    name: 'buscar_verificacion',  {const tools = [// Define las tools para Gemini```typescriptVer [API_GATEWAY_INTEGRATION.ts](./API_GATEWAY_INTEGRATION.ts) para código completo.### Configuración en API Gateway```Gemini responde al usuario: "Cambio realizado exitosamente"    ↓[MCP Server] Cambia estado    ↓Gemini: Ejecutar cambiar_a_verificado(id=verify-123)    ↓Respuesta: esPendiente = true    ↓[MCP Server] Ejecuta tool    ↓Gemini decide: Ejecutar es_pendiente(id=verify-123)    ↓[Gemini] Lee el mensaje y disponibles tools    ↓[API Gateway] ← POST /api/gemini/ask    ↓Usuario: "¿Puedo cambiar verify-123 a verificado?"```### Flujo de integraciónEl MCP Server está diseñado para ser consumido por Google Gemini mediante Function Calling.## 🤖 Integración con Gemini```}  }    "timestamp": "2024-01-15T10:35:00Z"    },      "fechaActualizacion": "2024-01-15T10:35:00Z"      "razon": "Documentación completa y validada",      "estadoAnterior": "PENDIENTE",      "estado": "VERIFICADO",      "arquitectoId": "arch-789",      "id": "verify-456",    "data": {    "success": true,  "result": {  "id": "3",  "jsonrpc": "2.0",{```json**Respuesta Exitosa**:```}  }    "razon": "Documentación completa y validada"    "id": "verify-456",  "params": {  "method": "cambiar_a_verificado",  "id": "3",  "jsonrpc": "2.0",{```json**Ejemplo de Solicitud**:| `razon` | string | No | Razón del cambio para auditoría || `id` | string | **Sí** | ID de la verificación ||-----------|------|-----------|-------------|| Parámetro | Tipo | Requerido | Descripción |**Parámetros**:**Método**: `cambiar_a_verificado`Cambia el estado de una verificación a VERIFICADO.### 3. `cambiar_a_verificado` ✅```}  }    "timestamp": "2024-01-15T10:30:00Z"    },      "mensaje": "La verificación verify-123 está en estado PENDIENTE y lista para ser procesada"      "estadoActual": "PENDIENTE",      "esPendiente": true,      "id": "verify-123",    "data": {    "success": true,  "result": {  "id": "2",  "jsonrpc": "2.0",{```json**Respuesta Exitosa**:```}  }    "id": "verify-123"  "params": {  "method": "es_pendiente",  "id": "2",  "jsonrpc": "2.0",{```json**Ejemplo de Solicitud**:| `id` | string | **Sí** | ID de la verificación ||-----------|------|-----------|-------------|| Parámetro | Tipo | Requerido | Descripción |**Parámetros**:**Método**: `es_pendiente`Valida rápidamente si una verificación está pendiente.### 2. `es_pendiente` ⏳```}  }    "timestamp": "2024-01-15T10:30:00Z"    ],      }        "fechaActualizacion": "2024-01-15T10:00:00Z"        "fechaCreacion": "2024-01-15T10:00:00Z",        "descripcion": "Verificación de documentos",        "estado": "PENDIENTE",        "arquitectoId": "arch-456",        "id": "verify-123",      {    "data": [    "success": true,  "result": {  "id": "1",  "jsonrpc": "2.0",{```json**Respuesta Exitosa**:```}  }    "limit": 20    "estado": "PENDIENTE",  "params": {  "method": "buscar_verificacion",  "id": "1",  "jsonrpc": "2.0",{```json**Ejemplo de Solicitud**:| `offset` | number | No | Para paginación (default: 0) || `limit` | number | No | Máximo 1-100 (default: 10) || `estado` | string | No | PENDIENTE, VERIFICADO, RECHAZADO, EN_PROGRESO || `arquitectoId` | string | No | ID del arquitecto || `id` | string | No | ID específico de la verificación ||-----------|------|-----------|-------------|| Parámetro | Tipo | Requerido | Descripción |**Parámetros**:**Método**: `buscar_verificacion`Busca verificaciones según criterios múltiples.### 1. `buscar_verificacion` 🔍## 🔧 Tools Disponibles```Usuario/Cliente     ▼     │[JSON-RPC 2.0 Response]     ▼     │└────────────────────────────────────┘│  • Procesa respuesta               ││  • Llamadas al backend             ││  • Valida criterios                ││    Tool Execution                  │┌────────────────────────────────────┐     ▼     │└────────────────────────────────────┘│  • Valida parámetros               ││  • Busca la tool por nombre         ││    Tool Registry                   │┌────────────────────────────────────┐     ▼     │└────────────────────────────────────┘│  • Valida estructura                ││  • Parsea JSON-RPC 2.0             ││    Express Server (/rpc)           │┌────────────────────────────────────┐     ▼     │[JSON-RPC 2.0 Request]     ▼     │Usuario/Cliente```### Flujo de Datos```└── README.md (este archivo)├── .env.example├── tsconfig.json├── package.json│       └── mcp.types.ts               # Tipos TypeScript y JSON Schema│   └── types/│   │   └── cambiar_a_verificado.tool.ts│   │   ├── es_pendiente.tool.ts│   │   ├── buscar_verificacion.tool.ts│   │   ├── registry.ts                # Registro de tools│   ├── tools/│   │   └── backend-client.ts          # Cliente HTTP al backend│   ├── services/│   ├── server.ts                      # Express + JSON-RPC 2.0├── src/mcp-server/```### Componentes## 🏗️ Arquitectura```}  }    "status": "connected"  "backend": {  },    "protocol": "JSON-RPC 2.0"    "port": 9000,    "version": "1.0.0",  "server": {  "status": "healthy",  "success": true,{```jsonDeberías ver:```curl http://localhost:9000/health```bash### Verificar que esté corriendo```npm startnpm run build```bash### Iniciar en modo producción```npm run dev```bash### Iniciar en modo desarrollo## 🚀 Inicio Rápido```npm run build```bash### 4. Compilar TypeScript```# Editar .env según necesariocp .env.example .env```bash### 3. Configurar ambiente```npm install```bash### 2. Instalar dependencias```cd vsls:/2parcial/semana13/mcp-server```bash### 1. Clonar el repositorio## 🛠️ Instalación- **Docker** (opcional, para ejecutar completo)- **Backend REST** en puerto 3001 (microservicio verificación)- **npm** o **yarn**- **Node.js** >= 16.x## 📦 Requisitos- ✅ **Logs detallados** para debugging- ✅ **Express** servidor ligero y rápido- ✅ **TypeScript** para type-safety- ✅ **Documentación completa** con ejemplos- ✅ **Health checks** y conectividad con backend- ✅ **Manejo robusto de errores** con códigos JSON-RPC estándar- ✅ **Validación JSON Schema** en todos los parámetros- ✅ **3 Tools listos**: buscar_verificacion, es_pendiente, cambiar_a_verificado- ✅ **Implementación JSON-RPC 2.0** completa y conforme a estándares## ✨ Características- [Troubleshooting](#troubleshooting)- [API Reference](#api-reference)- [Ejemplos](#ejemplos)- [Integración con Gemini](#integración-con-gemini)- [Tools Disponibles](#tools-disponibles)- [Arquitectura](#arquitectura)- [Inicio Rápido](#inicio-rápido)- [Instalación](#instalación)- [Requisitos](#requisitos)- [Características](#características)## 📋 Tabla de Contenidos```╚════════════════════════════════════════════════════════╝║  🐳 Integrable con Gemini y otros clientes MCP         ║║  🔧 3 Tools: buscar, validar, cambiar                  ║║  📡 JSON-RPC 2.0                                       ║║                                                        ║║       MCP Server - Verificación                        ║╔════════════════════════════════════════════════════════╗```Servidor MCP (Model Context Protocol) implementado en TypeScript/Express que expone tres tools para gestión de verificaciones mediante JSON-RPC 2.0.
## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Instalación](#instalación)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Iniciar el Servidor](#iniciar-el-servidor)
5. [API JSON-RPC 2.0](#api-jsonrpc-20)
6. [Tools Disponibles](#tools-disponibles)
7. [Ejemplos de Uso](#ejemplos-de-uso)
8. [Integración con API Gateway](#integración-con-api-gateway)

---

## Descripción General

**MCP Server** es un servidor implementado con Express que expone **3 tools** mediante **JSON-RPC 2.0** para gestionar verificaciones en la arquitectura de microservicios.

### Características
✅ Protocolo JSON-RPC 2.0 completo  
✅ 3 Tools para gestión de verificaciones  
✅ Validación de entrada con JSON Schema  
✅ Manejo de errores robusto  
✅ Logging configurable  
✅ Documentación automática de tools  

---

## Instalación

### 1. Requisitos
- Node.js 18+
- npm o yarn
- Variables de entorno configuradas

### 2. Instalar Dependencias
```bash
cd vsls:/2parcial/semana13/mcp-server
npm install
```

### 3. Configurar Variables de Entorno
```bash
cp .env.example .env
```

Editar `.env`:
```env
MCP_SERVER_PORT=3500
MCP_SERVER_HOST=0.0.0.0
VERIFICACION_SERVICE_URL=http://localhost:3002
VERIFICACION_SERVICE_TIMEOUT=5000
LOG_LEVEL=debug
NODE_ENV=development
```

---

## Estructura del Proyecto

```
mcp-server/
├── src/
│   ├── server.ts                    # Servidor principal Express + JSON-RPC
│   ├── tools/
│   │   ├── buscar_verificacion.tool.ts   # Tool 1: Búsqueda
│   │   ├── es_pendiente.tool.ts          # Tool 2: Validación
│   │   ├── cambiar_a_verificado.tool.ts  # Tool 3: Actualización
│   │   └── registry.ts              # Registry centralizado de tools
│   └── types/
│       └── mcp.types.ts             # Tipos TypeScript
├── dist/                            # Código compilado (generado)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## Iniciar el Servidor

### Modo Desarrollo (con hot reload)
```bash
npm run dev
```

### Modo Producción
```bash
npm run build
npm start
```

### Salida esperada
```
[2024-01-06T10:30:45.123Z] INFO: =================================================
[2024-01-06T10:30:45.124Z] INFO: MCP Server iniciado
[2024-01-06T10:30:45.125Z] INFO: Host: 0.0.0.0
[2024-01-06T10:30:45.126Z] INFO: Puerto: 3500
[2024-01-06T10:30:45.127Z] INFO: URL: http://0.0.0.0:3500
[2024-01-06T10:30:45.128Z] INFO: Tools registrados: 3
[2024-01-06T10:30:45.129Z] INFO: =================================================
[2024-01-06T10:30:45.130Z] INFO:   ✓ buscar_verificacion - Busca una verificación...
[2024-01-06T10:30:45.131Z] INFO:   ✓ es_pendiente - Valida si una verificación está...
[2024-01-06T10:30:45.132Z] INFO:   ✓ cambiar_a_verificado - Actualiza el estado...
[2024-01-06T10:30:45.133Z] INFO: =================================================
```

---

## API JSON-RPC 2.0

### Protocolo

**Endpoint**: `POST http://localhost:3500/rpc`

**Formato de Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools.call",
  "params": {
    "name": "nombre_del_tool",
    "params": { /* parámetros del tool */ }
  },
  "id": "request-1"
}
```

**Formato de Response (Exitoso)**:
```json
{
  "jsonrpc": "2.0",
  "result": { /* resultado del tool */ },
  "id": "request-1"
}
```

**Formato de Response (Error)**:
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Error description",
    "data": { /* información adicional */ }
  },
  "id": "request-1"
}
```

### Códigos de Error JSON-RPC
| Código | Significado |
|--------|-------------|
| -32700 | Parse error |
| -32600 | Invalid Request |
| -32601 | Method not found |
| -32602 | Invalid params |
| -32603 | Internal error |
| -32000 | Server error |
| -32001 | Backend error |
| -32002 | Validation error |

### Métodos Disponibles

#### 1. `tools.list`
Lista los nombres de todos los tools disponibles.

**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools.list",
  "id": "1"
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tools": ["buscar_verificacion", "es_pendiente", "cambiar_a_verificado"],
    "count": 3,
    "timestamp": "2024-01-06T10:30:45.123Z"
  },
  "id": "1"
}
```

---

#### 2. `tools.all`
Obtiene información completa de todos los tools (incluyendo schemas).

**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools.all",
  "id": "2"
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [
      {
        "name": "buscar_verificacion",
        "description": "Busca una verificación...",
        "inputSchema": { /* JSON Schema */ },
        "outputSchema": { /* JSON Schema */ }
      }
      // ... más tools
    ],
    "count": 3,
    "timestamp": "2024-01-06T10:30:45.123Z"
  },
  "id": "2"
}
```

---

#### 3. `tools.describe`
Obtiene esquema detallado de un tool específico.

**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools.describe",
  "params": {
    "name": "buscar_verificacion"
  },
  "id": "3"
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "name": "buscar_verificacion",
    "description": "Busca una verificación...",
    "inputSchema": { /* JSON Schema */ },
    "outputSchema": { /* JSON Schema */ },
    "timestamp": "2024-01-06T10:30:45.123Z"
  },
  "id": "3"
}
```

---

#### 4. `tools.call`
Ejecuta un tool específico con los parámetros proporcionados.

**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools.call",
  "params": {
    "name": "buscar_verificacion",
    "params": {
      "id": "550e8400-e29b-41d4-a716-446655440000"
    }
  },
  "id": "4"
}
```

---

## Tools Disponibles

### Tool 1: `buscar_verificacion`

**Descripción**: Busca una verificación por criterios (ID, arquitecto_id, estado).

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "UUID de la verificación"
    },
    "arquitecto_id": {
      "type": "string",
      "description": "UUID del arquitecto"
    },
    "estado": {
      "type": "string",
      "enum": ["pendiente", "verificado", "rechazado"],
      "description": "Estado de la verificación"
    }
  },
  "required": [],
  "description": "Al menos uno de los parámetros debe ser proporcionado"
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "found": { "type": "string", "description": "true o false" },
    "verificacion": { "type": "object" },
    "message": { "type": "string" }
  },
  "required": ["found", "message"]
}
```

---

### Tool 2: `es_pendiente`

**Descripción**: Valida si una verificación está en estado PENDIENTE.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "UUID de la verificación"
    }
  },
  "required": ["id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "esPendiente": { "type": "string", "description": "true o false" },
    "estado_actual": { "type": "string" },
    "message": { "type": "string" }
  },
  "required": ["esPendiente", "estado_actual", "message"]
}
```

---

### Tool 3: `cambiar_a_verificado`

**Descripción**: Actualiza el estado de una verificación a "verificado". **OPERACIÓN DE ESCRITURA**.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "UUID de la verificación"
    },
    "moderador_id": {
      "type": "string",
      "description": "UUID del moderador que realiza el cambio"
    },
    "razon": {
      "type": "string",
      "description": "Razón del cambio (opcional)"
    },
    "validar_pendiente": {
      "type": "string",
      "description": "Si es true, valida que esté pendiente (recomendado)"
    }
  },
  "required": ["id", "moderador_id"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": { "type": "string", "description": "true o false" },
    "verificacion": { "type": "object" },
    "message": { "type": "string" }
  },
  "required": ["success", "message"]
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Listar Tools Disponibles

**cURL**:
```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.list",
    "id": "1"
  }'
```

**PowerShell**:
```powershell
$body = @{
  jsonrpc = "2.0"
  method = "tools.list"
  id = "1"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3500/rpc" `
  -Method Post `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body
```

---

### Ejemplo 2: Buscar Verificación por ID

**cURL**:
```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "buscar_verificacion",
      "params": {
        "id": "550e8400-e29b-41d4-a716-446655440000"
      }
    },
    "id": "2"
  }'
```

**JavaScript/Node.js**:
```javascript
const response = await fetch('http://localhost:3500/rpc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools.call',
    params: {
      name: 'buscar_verificacion',
      params: {
        id: '550e8400-e29b-41d4-a716-446655440000'
      }
    },
    id: '2'
  })
});

const data = await response.json();
console.log(data);
```

**Respuesta Exitosa**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tool": "buscar_verificacion",
    "result": {
      "found": true,
      "verificacion": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "arquitecto_id": "660e8400-e29b-41d4-a716-446655440001",
        "moderador_id": "770e8400-e29b-41d4-a716-446655440002",
        "estado": "pendiente",
        "fecha_verificacion": "2024-01-06T10:30:00.000Z",
        "created_at": "2024-01-06T10:00:00.000Z",
        "updated_at": "2024-01-06T10:30:00.000Z"
      },
      "message": "Verificación encontrada: 550e8400-e29b-41d4-a716-446655440000"
    },
    "timestamp": "2024-01-06T10:30:45.123Z"
  },
  "id": "2"
}
```

---

### Ejemplo 3: Validar si está Pendiente

**cURL**:
```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "es_pendiente",
      "params": {
        "id": "550e8400-e29b-41d4-a716-446655440000"
      }
    },
    "id": "3"
  }'
```

**Respuesta**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tool": "es_pendiente",
    "result": {
      "esPendiente": "true",
      "estado_actual": "pendiente",
      "message": "La verificación 550e8400-e29b-41d4-a716-446655440000 está en estado PENDIENTE"
    },
    "timestamp": "2024-01-06T10:30:45.123Z"
  },
  "id": "3"
}
```

---

### Ejemplo 4: Cambiar a Verificado

**cURL**:
```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "cambiar_a_verificado",
      "params": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "moderador_id": "880e8400-e29b-41d4-a716-446655440003",
        "razon": "Documentación completa y verificada",
        "validar_pendiente": "true"
      }
    },
    "id": "4"
  }'
```

**PowerShell**:
```powershell
$body = @{
  jsonrpc = "2.0"
  method = "tools.call"
  params = @{
    name = "cambiar_a_verificado"
    params = @{
      id = "550e8400-e29b-41d4-a716-446655440000"
      moderador_id = "880e8400-e29b-41d4-a716-446655440003"
      razon = "Documentación completa"
      validar_pendiente = "true"
    }
  }
  id = "4"
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri "http://localhost:3500/rpc" `
  -Method Post `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body
```

**Respuesta**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tool": "cambiar_a_verificado",
    "result": {
      "success": "true",
      "verificacion": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "arquitecto_id": "660e8400-e29b-41d4-a716-446655440001",
        "moderador_id": "880e8400-e29b-41d4-a716-446655440003",
        "estado": "verificado",
        "fecha_verificacion": "2024-01-06T10:30:00.000Z",
        "created_at": "2024-01-06T10:00:00.000Z",
        "updated_at": "2024-01-06T10:31:00.000Z"
      },
      "message": "Verificación 550e8400-e29b-41d4-a716-446655440000 cambió a estado VERIFICADO. Moderador: 880e8400-e29b-41d4-a716-446655440003"
    },
    "timestamp": "2024-01-06T10:30:45.123Z"
  },
  "id": "4"
}
```

---

### Ejemplo 5: Buscar por Arquitecto

**cURL**:
```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "buscar_verificacion",
      "params": {
        "arquitecto_id": "660e8400-e29b-41d4-a716-446655440001",
        "estado": "pendiente"
      }
    },
    "id": "5"
  }'
```

---

## Integración con API Gateway

### Flujo Esperado

```
┌──────────────────────────────────────────────────────────────┐
│                    Usuario Final                              │
│           Texto: "¿La verificación XYZ está      │
│                   pendiente?"                       │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│              API Gateway (NestJS)                             │
│                                                               │
│  1. Recibe request del usuario                                │
│  2. Llamada a Gemini API                                      │
│  3. Gemini decide: "Usar tool es_pendiente"                  │
│  4. Envía request JSON-RPC al MCP Server                     │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│            MCP Server (Express)                               │
│                                                               │
│  1. Recibe JSON-RPC: tools.call es_pendiente                │
│  2. Valida parámetros                                         │
│  3. Ejecuta tool: obtiene estado de BD                       │
│  4. Retorna resultado                                         │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│           Microservicio Verificación                          │
│                                                               │
│  1. REST GET /verificacion/{id}                              │
│  2. Consulta BD PostgreSQL                                   │
│  3. Retorna datos de verificación                            │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   ◀─ Respuesta JSON
                   │
                   ▼
        ┌─────────────────────────┐
        │  MCP Server Response     │
        │  {                        │
        │    esPendiente: "true",  │
        │    estado: "pendiente"   │
        │  }                        │
        └────────────┬─────────────┘
                     │
                     ▼
        ┌─────────────────────────────────────┐
        │  API Gateway (Gemini)                │
        │                                      │
        │  Genera respuesta al usuario:        │
        │  "Sí, la verificación está         │
        │   en estado pendiente"               │
        └────────────┬────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │   Usuario Final          │
        │   Recibe respuesta       │
        └─────────────────────────┘
```

### Ejemplo de Integración en API Gateway

```typescript
// En el servicio de API Gateway
import axios from 'axios';

class VerificacionService {
  private mcpServerUrl = 'http://localhost:3500/rpc';

  async ejecutarTool(
    toolName: string,
    params: Record<string, unknown>
  ): Promise<any> {
    const response = await axios.post(this.mcpServerUrl, {
      jsonrpc: '2.0',
      method: 'tools.call',
      params: {
        name: toolName,
        params,
      },
      id: `req-${Date.now()}`,
    });

    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    return response.data.result;
  }

  async buscarVerificacion(
    criterios: Record<string, unknown>
  ): Promise<any> {
    return this.ejecutarTool('buscar_verificacion', criterios);
  }

  async esPendiente(verificacionId: string): Promise<boolean> {
    const result = await this.ejecutarTool('es_pendiente', {
      id: verificacionId,
    });
    return result.result.esPendiente === 'true';
  }

  async cambiarAVerificado(
    verificacionId: string,
    moderadorId: string
  ): Promise<any> {
    return this.ejecutarTool('cambiar_a_verificado', {
      id: verificacionId,
      moderador_id: moderadorId,
      validar_pendiente: 'true',
    });
  }
}
```

---

## Troubleshooting

### Error: "No se puede conectar al microservicio de verificación"
- Verificar que el microservicio-verificacion esté corriendo en Docker
- Confirmar que `VERIFICACION_SERVICE_URL` apunta a la dirección correcta
- Probar conectividad: `curl http://localhost:3002/verificacion`

### Error: "ID de verificación inválido"
- Asegurarse que los UUIDs estén en formato válido
- Usar: `550e8400-e29b-41d4-a716-446655440000`

### Error: "La verificación no está en estado pendiente"
- Consultar estado actual usando `es_pendiente`
- Solo se puede cambiar a verificado desde estado "pendiente"

### Error: "Validation error: Al menos uno de los parámetros es requerido"
- Para `buscar_verificacion` proporcionar al menos id, arquitecto_id o estado

---

## Performance

- **Timeout default**: 5000ms (configurable en `.env`)
- **Max request body**: 10MB
- **Recomendación**: 100-1000 requests/segundo por instancia

---

## Seguridad

En producción se recomienda:
1. Implementar autenticación (JWT, OAuth2)
2. Usar HTTPS
3. Validar headers (origen, content-type)
4. Rate limiting
5. Logging de auditoría
6. Secretos en variables de entorno


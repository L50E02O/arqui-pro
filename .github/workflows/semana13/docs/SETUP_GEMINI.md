# Gemini + MCP Server Integration - Setup Guide

## Resumen de la Integración

Esta integración conecta:
- **MCP Server** (Express en puerto 9000): Ejecuta las 3 tools de verificación
- **API Gateway** (NestJS en puerto 3000): Expone endpoints REST con Gemini
- **Google Generative AI (Gemini)**: Procesa lenguaje natural y decide qué tools usar

## Prerequisites

Antes de empezar, asegúrate de tener:

```
✅ Node.js 18+ instalado
✅ npm o yarn disponible
✅ Gemini API Key (obtén aquí: https://aistudio.google.com/apikey)
✅ Terminal/PowerShell abierta
✅ MCP Server creado y funcionando (de sesión anterior)
```

## Step 1: Obtener Gemini API Key

1. Ve a [Google AI Studio](https://aistudio.google.com/)
2. Haz clic en "Get API Key"
3. Crea una nueva clave de API
4. Copia la clave (la usaremos en el paso 3)

## Step 2: Configurar MCP Server

El MCP Server ya debe estar creado. Verifica que está funcionando:

```bash
# Terminal 1: Ir al directorio del MCP Server
cd 2parcial/semana13/mcp-server

# Instalar dependencias (si no lo hiciste)
npm install

# Iniciar el servidor
npm run start

# Esperado: 
# MCP Server listening on port 9000
# Expresshttps://localhost:9000
```

**Si no ves este mensaje, revisa los logs o reinicia el servidor.**

## Step 3: Configurar API Gateway con Gemini

```bash
# Terminal 2: Ir al directorio del API Gateway
cd 2parcial/semana13/api-gateway

# Instalar dependencias (necesario para nuevos paquetes de Gemini)
npm install

# Crear archivo .env basado en .env.example
cp .env.example .env

# IMPORTANTE: Editar .env e insertar tu GEMINI_API_KEY
# Usa tu editor favorito (nano, vim, VS Code, etc.)
```

### Contenido de `.env`:
```env
GEMINI_API_KEY=tu-clave-real-de-gemini
MCP_SERVER_URL=http://localhost:9000
PORT=3000
NODE_ENV=development
```

## Step 4: Iniciar API Gateway

```bash
# En Terminal 2 (en directorio api-gateway)
npm run start

# Esperado:
# [NestFactory] Starting Nest application...
# Nest application successfully started on port 3000
```

## Step 5: Verificar que Todo Funciona

Abre **Terminal 3** y ejecuta:

```bash
# Health Check
curl -X GET http://localhost:3000/api/gemini/health

# Esperado:
# {
#   "success": true,
#   "gemini": true,
#   "mcpServer": true,
#   "timestamp": "2024-01-15T10:30:00Z"
# }
```

Si la respuesta es exitosa con `"gemini": true` y `"mcpServer": true`, ¡todo está configurado! 🎉

## Step 6: Probar la Integración

### Test 1: Listar Tools Disponibles
```bash
curl -X GET http://localhost:3000/api/gemini/tools
```

### Test 2: Hacer una Pregunta Simple
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Hola Gemini?"}'
```

### Test 3: Hacer una Pregunta sobre Verificaciones
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuántas verificaciones pendientes hay?"}'
```

Gemini debe usar automáticamente el tool `buscar_verificacion` para responder.

## Troubleshooting

### Error: "GEMINI_API_KEY no encontrada"

**Síntoma:**
```
Error: GEMINI_API_KEY no encontrada en variables de entorno
```

**Solución:**
1. Verifica que existe el archivo `.env` en `api-gateway/`
2. Verifica que contiene la línea: `GEMINI_API_KEY=tu-clave`
3. Asegúrate de que la clave es válida (obtenida de Google AI Studio)
4. Reinicia el API Gateway: `npm run start`

---

### Error: "No se pudo conectar con MCP Server"

**Síntoma:**
```
Error: connect ECONNREFUSED 127.0.0.1:9000
```

**Solución:**
1. Verifica que MCP Server está corriendo en Terminal 1:
   ```bash
   cd 2parcial/semana13/mcp-server
   npm run start
   ```
2. Verifica que el puerto 9000 está libre
3. Verifica que MCP_SERVER_URL en .env es correcto: `http://localhost:9000`

---

### Error: "Health check returns gemini: false"

**Síntoma:**
```json
{
  "success": true,
  "gemini": false,
  "mcpServer": true
}
```

**Solución:**
1. Verifica que GEMINI_API_KEY en `.env` es válida
2. Verifica que la clave no tiene espacios extras
3. Reinicia API Gateway
4. Prueba la clave en [Google AI Studio](https://aistudio.google.com/)

---

### Error: "Tool not found" o Tool execution timeout

**Síntoma:**
```
Error: Tool 'nombre_tool' no encontrada
o
Timeout esperando respuesta del MCP Server
```

**Solución:**
1. Verifica que MCP Server está corriendo
2. Prueba el endpoint health: `GET http://localhost:3000/api/gemini/health`
3. Verifica los logs del MCP Server para errores
4. Intenta con una pregunta más específica

---

## Architecture Flow

```
┌──────────────────────────────────────────────────────────────┐
│                     User Browser/Client                       │
│                    curl / Postman / JS                        │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ HTTP REST Request
                     │ POST /api/gemini/ask
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│              API Gateway (NestJS, :3000)                      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           GeminiController                          │    │
│  │           (handles HTTP endpoints)                  │    │
│  └────────────────┬─────────────────────────────────┬──┘    │
│                   │                                 │         │
│                   ▼                                 ▼         │
│           ┌──────────────────┐           ┌─────────────────┐ │
│           │ GeminiService    │           │ Other Modules   │ │
│           │ (Gemini Logic)   │           │ (Arquitecto,    │ │
│           │                  │           │  Verificacion)  │ │
│           └────────┬─────────┘           └─────────────────┘ │
└────────────────────┼────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │ HTTP JSON-RPC           │
        │ POST /rpc               │
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│            MCP Server (Express, :9000)                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Backend Client                                      │    │
│  │ (HTTP calls to microservices)                       │    │
│  └────────────────┬────────────────────────────────────┘    │
│                   │                                          │
│     ┌─────────────┴──────────────┐                          │
│     │                            │                          │
│     ▼                            ▼                          │
│ ┌────────────┐          ┌────────────────┐                 │
│ │ Verification │        │ Architect       │                │
│ │ Microservice │        │ Microservice    │                │
│ │ (:3001)     │        │ (:3001)        │                │
│ └────────────┘         └────────────────┘                 │
└──────────────────────────────────────────────────────────────┘
```

## Two-Phase Processing

Cuando haces una pregunta, Gemini hace esto:

### Fase 1: Análisis y Decisión
```
Pregunta del Usuario: "¿Cuántas verificaciones pendientes hay?"
              ↓
Gemini analiza la pregunta
              ↓
Decide qué tool usar: buscar_verificacion
              ↓
Genera parámetros: { estado: "PENDIENTE" }
```

### Fase 2: Ejecución y Respuesta
```
Parámetros decididos
              ↓
API Gateway envía a MCP Server: POST /rpc
              ↓
MCP Server ejecuta tool
              ↓
Retorna resultados (ej: ["verif-1", "verif-2", "verif-3"])
              ↓
Gemini recibe resultados
              ↓
Genera respuesta natural:
"Encontré 3 verificaciones pendientes:
 - verif-1: Validación de plano A
 - verif-2: Revisión estructural
 - verif-3: Comprobación de normativa"
```

## Example Usage

### PowerShell Script para Pruebas

Crea un archivo `test.ps1`:

```powershell
# Configuración
$apiGateway = "http://localhost:3000"
$headers = @{"Content-Type" = "application/json"}

# Test 1: Health Check
Write-Host "=== Test 1: Health Check ===" -ForegroundColor Cyan
$response = Invoke-WebRequest -Uri "$apiGateway/api/gemini/health" -Method Get
$response.Content | ConvertFrom-Json | Format-List

# Test 2: List Tools
Write-Host "`n=== Test 2: List Available Tools ===" -ForegroundColor Cyan
$response = Invoke-WebRequest -Uri "$apiGateway/api/gemini/tools" -Method Get
$data = $response.Content | ConvertFrom-Json
$data.tools | Format-Table -Property name, description

# Test 3: Ask Simple Question
Write-Host "`n=== Test 3: Simple Question ===" -ForegroundColor Cyan
$body = @{"message" = "¿Hola Gemini?"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "$apiGateway/api/gemini/ask" `
  -Method Post -Headers $headers -Body $body
$response.Content | ConvertFrom-Json | Format-List

# Test 4: Ask About Verifications
Write-Host "`n=== Test 4: Query About Verifications ===" -ForegroundColor Cyan
$body = @{"message" = "¿Cuántas verificaciones pendientes hay?"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "$apiGateway/api/gemini/ask" `
  -Method Post -Headers $headers -Body $body
$response.Content | ConvertFrom-Json | Format-List
```

Ejecutar:
```powershell
./test.ps1
```

## File Structure Created

```
2parcial/semana13/
├── api-gateway/
│   ├── src/
│   │   ├── gemini/                    [NEW]
│   │   │   ├── gemini.controller.ts   [NEW]
│   │   │   ├── gemini.service.ts      [NEW]
│   │   │   ├── gemini.module.ts       [NEW]
│   │   │   └── dto/
│   │   │       └── ask-gemini.dto.ts  [NEW]
│   │   ├── app.module.ts              [MODIFIED]
│   │   └── ...
│   ├── .env                           [CREATE THIS]
│   ├── .env.local                     [NEW]
│   ├── .env.example                   [NEW]
│   ├── GEMINI_INTEGRATION.md          [NEW]
│   ├── GEMINI_TESTING.md              [NEW]
│   ├── package.json                   [MODIFIED - added @google/generative-ai, axios]
│   └── ...
├── mcp-server/
│   ├── src/
│   │   ├── server.ts
│   │   ├── backend-client.ts
│   │   ├── tools/
│   │   │   ├── buscar_verificacion.ts
│   │   │   ├── es_pendiente.ts
│   │   │   └── cambiar_a_verificado.ts
│   │   └── ...
│   └── ...
└── ...
```

## Next Steps

1. ✅ **Setup Gemini API Key**: Obtener de Google AI Studio
2. ✅ **Install Dependencies**: Ejecutar `npm install` en api-gateway
3. ✅ **Configure .env**: Crear archivo con GEMINI_API_KEY y MCP_SERVER_URL
4. ✅ **Start MCP Server**: `npm run start` en mcp-server
5. ✅ **Start API Gateway**: `npm run start` en api-gateway
6. ✅ **Test Health Check**: Verificar que gemini y mcpServer están true
7. ✅ **Test Endpoints**: Usar ejemplos en GEMINI_TESTING.md

## Documentation

- [GEMINI_INTEGRATION.md](./GEMINI_INTEGRATION.md) - Guía completa de integración
- [GEMINI_TESTING.md](./GEMINI_TESTING.md) - Ejemplos y casos de test
- [README.md](./README.md) - Información general del API Gateway

## Support

Si tienes problemas:

1. Revisa los logs del API Gateway (Terminal 2)
2. Revisa los logs del MCP Server (Terminal 1)
3. Ejecuta `GET /api/gemini/health` para diagnosticar
4. Verifica las variables de entorno en `.env`
5. Consulta la sección Troubleshooting arriba

---

**¡Listo para integrar Gemini con el API Gateway! 🚀**

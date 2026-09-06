# Gemini Integration - Testing Guide

## Quick Start Testing

### 1. Health Check
```bash
curl -X GET http://localhost:3000/api/gemini/health
```

**Expected Response:**
```json
{
  "success": true,
  "gemini": true,
  "mcpServer": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 2. List Available Tools
```bash
curl -X GET http://localhost:3000/api/gemini/tools
```

**Expected Response:**
```json
{
  "success": true,
  "count": 3,
  "tools": [
    {
      "name": "buscar_verificacion",
      "description": "Busca verificaciones por criterios específicos",
      "input_schema": {
        "type": "object",
        "properties": {...}
      }
    },
    {
      "name": "es_pendiente",
      "description": "Verifica si una verificación está pendiente",
      "input_schema": {...}
    },
    {
      "name": "cambiar_a_verificado",
      "description": "Cambia el estado de una verificación a verificado",
      "input_schema": {...}
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 3. Test Simple Query
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cuántas verificaciones hay?"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "response": "Basándome en la búsqueda realizada, encontré [X] verificaciones en el sistema...",
  "toolsUsed": ["buscar_verificacion"],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 4. Test Specific Status Query
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cuántas verificaciones están pendientes?"
  }'
```

---

### 5. Test Check If Pending
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Está pendiente la verificación con ID 1?"
  }'
```

**Expected to use tool:** `es_pendiente` with parameter `verificacion_id: 1`

---

### 6. Test Update Verification
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Por favor marca la verificación 1 como verificada"
  }'
```

**Expected to use tool:** `cambiar_a_verificado` with parameters `verificacion_id: 1`

---

### 7. Test with Context
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Necesito todas las verificaciones pendientes del arquitecto",
    "context": "arquitecto_id: 1"
  }'
```

---

## PowerShell Tests

### 1. Health Check (PowerShell)
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/gemini/health" `
  -Method Get -Headers @{"Content-Type"="application/json"}
$response.Content | ConvertFrom-Json | ConvertTo-Json
```

---

### 2. Ask Gemini (PowerShell)
```powershell
$body = @{
  message = "¿Cuántas verificaciones pendientes hay?"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/gemini/ask" `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

---

## JavaScript/Node.js Tests

### 1. Health Check
```javascript
async function healthCheck() {
  try {
    const response = await fetch('http://localhost:3000/api/gemini/health', {
      method: 'GET'
    });
    const data = await response.json();
    console.log('Health Status:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

healthCheck();
```

---

### 2. Ask Gemini
```javascript
async function askGemini(message) {
  try {
    const response = await fetch('http://localhost:3000/api/gemini/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message
      })
    });
    const data = await response.json();
    console.log('Response:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage
askGemini('¿Cuántas verificaciones hay?');
```

---

### 3. List Tools
```javascript
async function listTools() {
  try {
    const response = await fetch('http://localhost:3000/api/gemini/tools', {
      method: 'GET'
    });
    const data = await response.json();
    console.log('Available Tools:', data.tools);
  } catch (error) {
    console.error('Error:', error);
  }
}

listTools();
```

---

## Test Scenarios

### Scenario 1: Query Tools (buscar_verificacion)

**Test Case 1a: Get All Verifications**
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "Dame todas las verificaciones"}'
```

**Test Case 1b: Get by Status**
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuáles son las verificaciones PENDIENTES?"}'
```

**Test Case 1c: Get by Architect**
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuáles son las verificaciones del arquitecto 1?"}'
```

---

### Scenario 2: Check Status Tools (es_pendiente)

**Test Case 2a: Single Check**
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Está pendiente la verificación 1?"}'
```

**Test Case 2b: Multiple Checks**
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "Verifica si las verificaciones 1, 2 y 3 están pendientes"}'
```

---

### Scenario 3: Update Tools (cambiar_a_verificado)

**Test Case 3a: Simple Update**
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "Marca la verificación 1 como verificada"}'
```

**Test Case 3b: Update with Comment**
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "Marca la verificación 1 como verificada con comentario: Cumple todas las especificaciones"}'
```

---

### Scenario 4: Complex Queries (Multiple Tools)

**Test Case 4a: Query + Check**
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "Dame todas las verificaciones pendientes y dime cuál es la más antigua"}'
```

**Test Case 4b: Query + Update**
```bash
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "Busca la primera verificación pendiente y márcala como verificada"}'
```

---

## Expected Behaviors

### Success Response Structure
```json
{
  "success": true,
  "response": "Natural language response from Gemini",
  "toolsUsed": ["tool_name_1", "tool_name_2"],
  "timestamp": "ISO8601 timestamp"
}
```

### Error Response Structure
```json
{
  "success": false,
  "error": "Error description",
  "timestamp": "ISO8601 timestamp"
}
```

### Health Response Structure
```json
{
  "success": true,
  "gemini": true/false,
  "mcpServer": true/false,
  "timestamp": "ISO8601 timestamp"
}
```

---

## Debugging Tips

### 1. Enable Debug Logging
```bash
# Terminal 1: Start API Gateway with debug
DEBUG=api-gateway:* NODE_ENV=development npm run start

# Terminal 2: Run tests
curl http://localhost:3000/api/gemini/health
```

### 2. Check Gemini Service Logs
Look for these log patterns in the API Gateway console:
```
[GeminiService] initializeMCPTools Inicializando tools...
[GeminiService] processUserRequest Procesando solicitud: "¿..."
[GeminiService] executeMCPTool Ejecutando tool: tool_name
[GeminiService] [Phase 1] Gemini response with functionCalls
[GeminiService] [Phase 2] Executing tools...
[GeminiService] [Phase 2] Tool results received
[GeminiService] [Phase 3] Generating final response
```

### 3. Check MCP Server Logs
In another terminal running MCP Server:
```
[MCP Server] Received RPC call: tool_name
[MCP Server] Tool execution: STARTED
[MCP Server] Tool execution: SUCCESS/ERROR
```

### 4. Common Issues

**Issue: "GEMINI_API_KEY no encontrada"**
- Solution: Check `.env` file exists and contains GEMINI_API_KEY

**Issue: "No se pudo conectar con MCP Server"**
- Solution: 
  - Verify MCP Server is running: `npm run start` in mcp-server directory
  - Check MCP_SERVER_URL in .env (default: http://localhost:9000)
  - Check firewall/ports

**Issue: "Tool no existe"**
- Solution: Use GET /api/gemini/tools to verify tool names

**Issue: "Invalid tool parameters"**
- Solution: Check tool schema in GET /api/gemini/tools response

---

## Performance Testing

### 1. Measure Response Time
```bash
curl -w "\nTime: %{time_total}s\n" \
  -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Hola?"}'
```

### 2. Load Testing (using Apache Bench)
```bash
ab -n 100 -c 10 -p request.json -T application/json \
  http://localhost:3000/api/gemini/ask
```

Where `request.json`:
```json
{"message": "¿Cuántas verificaciones hay?"}
```

### 3. Concurrent Requests (PowerShell)
```powershell
1..10 | ForEach-Object {
  Invoke-WebRequest -Uri "http://localhost:3000/api/gemini/ask" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"message": "¿Hola?"}' `
    -AsJob
} | Wait-Job | Receive-Job
```

---

## Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "Gemini API Gateway",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3000/api/gemini/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "gemini", "health"]
        }
      }
    },
    {
      "name": "List Tools",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3000/api/gemini/tools",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "gemini", "tools"]
        }
      }
    },
    {
      "name": "Ask Gemini",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"message\": \"¿Cuántas verificaciones hay?\"}"
        },
        "url": {
          "raw": "http://localhost:3000/api/gemini/ask",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "gemini", "ask"]
        }
      }
    }
  ]
}
```

---

## Validation Checklist

Before considering the integration complete, verify:

- [ ] Health Check returns `{"gemini": true, "mcpServer": true}`
- [ ] Tools List shows all 3 tools
- [ ] Simple query works: Ask "¿Hola?" and get response
- [ ] Gemini uses `buscar_verificacion` tool when asked about verifications
- [ ] Gemini uses `es_pendiente` tool when asked to check status
- [ ] Gemini uses `cambiar_a_verificado` tool when asked to update
- [ ] Error handling works (test with invalid .env)
- [ ] Response times are reasonable (< 10 seconds for most queries)
- [ ] Logs show two-phase processing correctly

---

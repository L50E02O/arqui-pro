# 🛠️ Guía de Pruebas - MCP Server Tools

Este documento contiene ejemplos para probar las 3 tools disponibles en el MCP Server.

## 📋 Tools Disponibles

1. **buscar_verificacion** - Busca una verificación por ID, arquitecto_id o estado
2. **es_pendiente** - Verifica si una verificación está en estado pendiente
3. **cambiar_a_verificado** - Actualiza el estado de una verificación a "verificado"

## 🚀 Configuración Inicial

### 1. Verificar que el MCP Server está corriendo

```bash
# Verificar health check
curl http://localhost:3500/health
```

O en PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:3500/health" -Method Get
```

### 2. Verificar que las tools están disponibles

```bash
# Listar tools disponibles
curl http://localhost:3500/tools
```

O en PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:3500/tools" -Method Get
```

## 📡 Formato de Peticiones JSON-RPC

Todas las peticiones se envían como JSON-RPC 2.0 al endpoint `POST /rpc`:

```json
{
  "jsonrpc": "2.0",
  "method": "tools.call",
  "params": {
    "name": "nombre_del_tool",
    "params": {
      // parámetros específicos del tool
    }
  },
  "id": "request-id-unico"
}
```

## 🧪 Ejemplos de Pruebas

### Tool 1: buscar_verificacion

Esta tool permite buscar verificaciones por diferentes criterios.

#### 1.1 Buscar por ID

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
    "id": "search-by-id-1"
  }'
```

**PowerShell:**
```powershell
$body = @{
    jsonrpc = "2.0"
    method = "tools.call"
    params = @{
        name = "buscar_verificacion"
        params = @{
            id = "550e8400-e29b-41d4-a716-446655440000"
        }
    }
    id = "search-by-id-1"
} | ConvertTo-Json -Depth 5

Invoke-WebRequest -Uri "http://localhost:3500/rpc" `
    -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body
```

#### 1.2 Buscar por arquitecto_id

```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "buscar_verificacion",
      "params": {
        "arquitecto_id": "123e4567-e89b-12d3-a456-426614174000"
      }
    },
    "id": "search-by-arch-1"
  }'
```

**PowerShell:**
```powershell
$body = @{
    jsonrpc = "2.0"
    method = "tools.call"
    params = @{
        name = "buscar_verificacion"
        params = @{
            arquitecto_id = "123e4567-e89b-12d3-a456-426614174000"
        }
    }
    id = "search-by-arch-1"
} | ConvertTo-Json -Depth 5

Invoke-WebRequest -Uri "http://localhost:3500/rpc" `
    -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body
```

#### 1.3 Buscar por estado

```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "buscar_verificacion",
      "params": {
        "estado": "pendiente"
      }
    },
    "id": "search-by-state-1"
  }'
```

**PowerShell:**
```powershell
$body = @{
    jsonrpc = "2.0"
    method = "tools.call"
    params = @{
        name = "buscar_verificacion"
        params = @{
            estado = "pendiente"
        }
    }
    id = "search-by-state-1"
} | ConvertTo-Json -Depth 5

Invoke-WebRequest -Uri "http://localhost:3500/rpc" `
    -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body
```

### Tool 2: es_pendiente

Esta tool verifica si una verificación está en estado pendiente.

#### 2.1 Verificar estado pendiente

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
    "id": "check-pending-1"
  }'
```

**PowerShell:**
```powershell
$body = @{
    jsonrpc = "2.0"
    method = "tools.call"
    params = @{
        name = "es_pendiente"
        params = @{
            id = "550e8400-e29b-41d4-a716-446655440000"
        }
    }
    id = "check-pending-1"
} | ConvertTo-Json -Depth 5

Invoke-WebRequest -Uri "http://localhost:3500/rpc" `
    -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body
```

**Respuesta esperada:**
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
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "id": "check-pending-1"
}
```

### Tool 3: cambiar_a_verificado

Esta tool actualiza el estado de una verificación a "verificado".

#### 3.1 Cambiar estado a verificado (sin validar pendiente)

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
        "moderador_id": "789e0123-e45b-67c8-d901-234567890123",
        "razon": "Documentación completa y verificada"
      }
    },
    "id": "change-to-verified-1"
  }'
```

**PowerShell:**
```powershell
$body = @{
    jsonrpc = "2.0"
    method = "tools.call"
    params = @{
        name = "cambiar_a_verificado"
        params = @{
            id = "550e8400-e29b-41d4-a716-446655440000"
            moderador_id = "789e0123-e45b-67c8-d901-234567890123"
            razon = "Documentación completa y verificada"
        }
    }
    id = "change-to-verified-1"
} | ConvertTo-Json -Depth 5

Invoke-WebRequest -Uri "http://localhost:3500/rpc" `
    -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body
```

#### 3.2 Cambiar estado a verificado (validando que esté pendiente)

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
        "moderador_id": "789e0123-e45b-67c8-d901-234567890123",
        "razon": "Documentación validada exitosamente",
        "validar_pendiente": "true"
      }
    },
    "id": "change-to-verified-2"
  }'
```

**PowerShell:**
```powershell
$body = @{
    jsonrpc = "2.0"
    method = "tools.call"
    params = @{
        name = "cambiar_a_verificado"
        params = @{
            id = "550e8400-e29b-41d4-a716-446655440000"
            moderador_id = "789e0123-e45b-67c8-d901-234567890123"
            razon = "Documentación validada exitosamente"
            validar_pendiente = "true"
        }
    }
    id = "change-to-verified-2"
} | ConvertTo-Json -Depth 5

Invoke-WebRequest -Uri "http://localhost:3500/rpc" `
    -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body
```

**Respuesta esperada:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tool": "cambiar_a_verificado",
    "result": {
      "success": "true",
      "verificacion": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "estado": "verificado",
        "moderador_id": "789e0123-e45b-67c8-d901-234567890123",
        "fecha_verificacion": "2024-01-01T12:00:00.000Z"
      },
      "message": "Verificación 550e8400-e29b-41d4-a716-446655440000 cambió a estado VERIFICADO. Moderador: 789e0123-e45b-67c8-d901-234567890123"
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "id": "change-to-verified-2"
}
```

## 🔄 Flujo Completo de Ejemplo

### Paso 1: Buscar una verificación

```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "buscar_verificacion",
      "params": {
        "estado": "pendiente"
      }
    },
    "id": "step1"
  }'
```

### Paso 2: Verificar si está pendiente

```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "es_pendiente",
      "params": {
        "id": "ID_OBTENIDO_DEL_PASO_1"
      }
    },
    "id": "step2"
  }'
```

### Paso 3: Cambiar a verificado

```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "cambiar_a_verificado",
      "params": {
        "id": "ID_OBTENIDO_DEL_PASO_1",
        "moderador_id": "789e0123-e45b-67c8-d901-234567890123",
        "razon": "Verificación completada",
        "validar_pendiente": "true"
      }
    },
    "id": "step3"
  }'
```

## ⚠️ Manejo de Errores

### Error: Tool no encontrado

Si intentas usar un tool que no existe:

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32601,
    "message": "Method not found: tool_inexistente",
    "data": {
      "availableMethods": ["tools.list", "tools.call", "tools.describe", "tools.all", "ping", "health"]
    }
  },
  "id": "request-id"
}
```

### Error: Parámetros inválidos

Si faltan parámetros requeridos:

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32602,
    "message": "Missing required parameter: name (string)"
  },
  "id": "request-id"
}
```

### Error: Verificación no encontrada

Si la verificación no existe:

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32000,
    "message": "Verificación no encontrada: 550e8400-e29b-41d4-a716-446655440000"
  },
  "id": "request-id"
}
```

## 🔍 Obtener Información de un Tool

### Describir un tool específico

```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.describe",
    "params": {
      "name": "buscar_verificacion"
    },
    "id": "describe-1"
  }'
```

**PowerShell:**
```powershell
$body = @{
    jsonrpc = "2.0"
    method = "tools.describe"
    params = @{
        name = "buscar_verificacion"
    }
    id = "describe-1"
} | ConvertTo-Json -Depth 5

Invoke-WebRequest -Uri "http://localhost:3500/rpc" `
    -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body
```

### Listar todos los tools

```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.list",
    "id": "list-1"
  }'
```

## 📝 Notas Importantes

1. **UUIDs válidos**: Todos los IDs deben ser UUIDs válidos en formato `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

2. **Estados válidos**: Los estados aceptados son:
   - `pendiente`
   - `verificado`
   - `rechazado`

3. **Validación de pendiente**: El parámetro `validar_pendiente: "true"` en `cambiar_a_verificado` valida que la verificación esté en estado pendiente antes de cambiar. Esto es recomendado para evitar cambios de estado incorrectos.

4. **Microservicio de Verificación**: Las tools requieren que el microservicio de verificación esté corriendo en `http://localhost:3002` (o la URL configurada en `VERIFICACION_SERVICE_URL`).

5. **Timeouts**: Las peticiones tienen un timeout de 15 segundos por defecto.

## 🐛 Troubleshooting

### El servidor no responde

Verifica que el MCP Server esté corriendo:
```bash
curl http://localhost:3500/health
```

### Error de conexión al microservicio

Verifica que el microservicio de verificación esté corriendo:
```bash
curl http://localhost:3002/health
```

### Error de formato UUID

Asegúrate de que los UUIDs estén en el formato correcto:
```
Formato válido: 550e8400-e29b-41d4-a716-446655440000
Formato inválido: 550e8400e29b41d4a716446655440000
```

---

**🚀 ¡Listo para probar las tools!**

Si tienes problemas, revisa los logs del MCP Server para más detalles sobre los errores.


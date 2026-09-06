# 🚀 MCP Server - Quick Start Guide# MCP Server - Guía Rápida de Inicio







































































































































































































































































































**Última actualización:** 2024-01-15---Para dudas o reportar issues, consulta la documentación principal en [README.md](./README.md)## 📞 Soporte```Solución: Revisa que los parámetros coincidan con el esquema JSON```### Error: "Parámetros inválidos"```Solución: Verifica que el nombre de la tool sea exacto (case-sensitive)```### Error: "Tool no encontrada"```Solución: Verifica que el backend esté corriendo en puerto 3001```### Error: ECONNREFUSED (Backend no disponible)## ❓ Troubleshooting- [RESUMEN_TECNICO.md](./RESUMEN_TECNICO.md) - Resumen técnico- [API_GATEWAY_INTEGRATION.ts](./API_GATEWAY_INTEGRATION.ts) - Integración con API Gateway- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura detallada## 📚 Documentación CompletaEl MCP Server está diseñado para ser consumido por Gemini via Function Calling. Ver [GEMINI_FUNCTIONS.md](./GEMINI_FUNCTIONS.md) para detalles.## 🤝 Integración con GeminiLuego abre `chrome://inspect` en Chrome.```node --inspect src/server.ts```bash### Conectar con debugger```NODE_ENV=development```En `.env`:### Ver logs detallados## 🧪 Debugging| GET | `/health` | Health check || GET | `/tools` | Listar tools disponibles || POST | `/rpc` | Ejecutar JSON-RPC 2.0 || GET | `/` | Info general del servidor ||--------|------|-------------|| Método | Path | Descripción |## 🔗 Endpoints HTTP```}  }    "razon": "Documentación validada"    "id": "verify-456",  "params": {  "method": "cambiar_a_verificado",  "id": "change-1",  "jsonrpc": "2.0",{```json**Ejemplo:**- `razon` (string) - Razón del cambio (opcional)- `id` (string) ⚠️ Requerido - ID de la verificación**Parámetros:**Cambia el estado a VERIFICADO.### 3. `cambiar_a_verificado````}  }    "id": "verify-123"  "params": {  "method": "es_pendiente",  "id": "check-1",  "jsonrpc": "2.0",{```json**Ejemplo:**- `id` (string) ⚠️ Requerido - ID de la verificación**Parámetros:**Valida si una verificación está pendiente.### 2. `es_pendiente````}  }    "limit": 10    "estado": "PENDIENTE",  "params": {  "method": "buscar_verificacion",  "id": "search-1",  "jsonrpc": "2.0",{```json**Ejemplo:**- `offset` (number) - Para paginación (default: 0)- `limit` (number, 1-100) - Máximo de resultados (default: 10)- `estado` (string) - Estado: PENDIENTE, VERIFICADO, RECHAZADO, EN_PROGRESO- `arquitectoId` (string) - ID del arquitecto- `id` (string) - ID específico de la verificación**Parámetros:**Busca verificaciones por criterios.### 1. `buscar_verificacion`## 🛠️ Tools Disponibles```}  }    "message": "Tool no encontrada: herramienta_inexistente"    "code": -32601,  "error": {  "id": "identificador-único",  "jsonrpc": "2.0",{```json### Respuesta con error```}  }    "timestamp": "2024-01-15T10:30:00Z"    "data": { ...datos específicos de la tool... },    "success": true,  "result": {  "id": "identificador-único",  "jsonrpc": "2.0",{```json### Respuesta exitosa```}  }    "param2": "valor2"    "param1": "valor1",  "params": {  "method": "nombre-de-la-tool",  "id": "identificador-único",  "jsonrpc": "2.0",{```jsonToda solicitud debe seguir el formato:## 🔌 Estructura de JSON-RPC 2.0```node examples.js```bash### Node.js```.\examples.ps1```powershell### PowerShell/Windows```./examples.shchmod +x examples.sh```bash### Bash/Linux/Mac## 📚 Ejecutar Ejemplos Completos```  }'    "params": { "estado": "PENDIENTE" }    "method": "buscar_verificacion",    "id": "1",    "jsonrpc": "2.0",  -d '{  -H "Content-Type: application/json" \curl -X POST http://localhost:9000/rpc \```bash### 3. Ejecutar una Tool (buscar_verificacion)```curl http://localhost:9000/tools```bash### 2. Listar Tools```curl http://localhost:9000/health```bash### 1. Health Check## 📡 Probar el servidor```╚════════════════════════════════════════════════════════╝║    • cambiar_a_verificado                              ║║    • es_pendiente                                      ║║    • buscar_verificacion                               ║║ 🔧 Tools disponibles:                                  ║║ 📡 Protocolo: JSON-RPC 2.0                             ║║ 🚀 Servidor escuchando en: http://localhost:9000        ║╠════════════════════════════════════════════════════════╣║           MCP Server iniciado                          ║╔════════════════════════════════════════════════════════╗```Deberías ver:```npm startnpm run build```bash### Modo producción```npm run dev```bash### Modo desarrollo (con hot reload)## 🚀 Iniciar el servidor```# REQUEST_TIMEOUT=10000# BACKEND_BASE_URL=http://localhost:3001# MCP_SERVER_PORT=9000# Ejemplo:# Editar .env con tus valorescp .env.example .env# Copiar archivo de ejemplo```bash### 3. Configurar variables de entorno```npm install```bash### 2. Instalar dependencias```cd vsls:/2parcial/semana13/mcp-server```bash### 1. Clonar y navegar al directorio## 🛠️ Instalación- **Docker** (opcional, para infraestructura completa)- **Backend en ejecución**: El microservicio de verificación en puerto 3001- **npm** o **yarn**- **Node.js** >= 16.x## 📋 Requisitos PreviosGuía rápida para poner en marcha el MCP Server de Verificación.
## 🚀 Quick Start (5 minutos)

### 1. Instalación
```bash
cd vsls:/2parcial/semana13/mcp-server
npm install
```

### 2. Configuración
```bash
cp .env.example .env
```

### 3. Iniciar Servidor
```bash
npm run dev
```

Deberías ver:
```
MCP Server iniciado
Host: 0.0.0.0
Puerto: 3500
URL: http://0.0.0.0:3500
Tools registrados: 3
```

---

## 📝 Ejemplos Rápidos

### Health Check
```bash
curl http://localhost:3500/health
```

### Listar Tools
```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools.list","id":"1"}'
```

### Buscar Verificación
```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"tools.call",
    "params":{
      "name":"buscar_verificacion",
      "params":{"id":"550e8400-e29b-41d4-a716-446655440000"}
    },
    "id":"1"
  }'
```

### Validar si está Pendiente
```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"tools.call",
    "params":{
      "name":"es_pendiente",
      "params":{"id":"550e8400-e29b-41d4-a716-446655440000"}
    },
    "id":"2"
  }'
```

### Cambiar a Verificado
```bash
curl -X POST http://localhost:3500/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"tools.call",
    "params":{
      "name":"cambiar_a_verificado",
      "params":{
        "id":"550e8400-e29b-41d4-a716-446655440000",
        "moderador_id":"880e8400-e29b-41d4-a716-446655440003",
        "validar_pendiente":"true"
      }
    },
    "id":"3"
  }'
```

---

## 🧪 Ejecutar Test Suite

### Con bash (Linux/Mac)
```bash
bash examples.sh
```

### Con PowerShell (Windows)
```powershell
.\examples.ps1
```

### Con Node.js
```bash
node examples.js
# o
node examples.js http://localhost:3500
```

---

## 📚 Tools Disponibles

| Tool | Descripción | Tipo |
|------|-------------|------|
| `buscar_verificacion` | Busca por id, arquitecto_id, estado | Lectura |
| `es_pendiente` | Valida si está en estado pendiente | Lectura |
| `cambiar_a_verificado` | Cambia estado a verificado | Escritura |

---

## 🔗 Integración con API Gateway

En tu servicio de API Gateway:

```typescript
import axios from 'axios';

class MCPClient {
  private mcpUrl = 'http://localhost:3500/rpc';

  async callTool(name: string, params: any) {
    const response = await axios.post(this.mcpUrl, {
      jsonrpc: '2.0',
      method: 'tools.call',
      params: { name, params },
      id: `${Date.now()}`,
    });
    
    return response.data.result;
  }
}

// Usar
const mcp = new MCPClient();
const result = await mcp.callTool('buscar_verificacion', {
  id: '550e8400-e29b-41d4-a716-446655440000'
});
```

---

## 🔧 Troubleshooting

**Error: Connection refused**
- Asegúrate que el servidor está corriendo: `npm run dev`
- Verifica el puerto: `netstat -an | grep 3500`

**Error: Backend service unreachable**
- Verifica que microservicio-verificacion esté en Docker
- Comprueba `VERIFICACION_SERVICE_URL` en `.env`

**Error: Invalid UUID**
- Usa UUIDs en formato válido: `550e8400-e29b-41d4-a716-446655440000`

---

## 📖 Documentación Completa

Ver [README.md](./README.md) para documentación detallada de:
- JSON-RPC 2.0 Protocol
- Esquemas JSON de cada tool
- Ejemplos avanzados
- Integración con Gemini
- Seguridad en producción

---

## 🎯 Próximos Pasos

1. ✅ MCP Server creado
2. ⏭️ Integrar con API Gateway (NestJS + Gemini Function Calling)
3. ⏭️ Configurar autenticación y autorización
4. ⏭️ Implementar logging y auditoría
5. ⏭️ Desplegar en producción

---

## 📞 Soporte

Para preguntas sobre MCP Protocol:
- https://spec.modelcontextprotocol.io/
- JSON-RPC 2.0: https://www.jsonrpc.org/specification


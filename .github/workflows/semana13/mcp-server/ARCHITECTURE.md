# 🏗️ Arquitectura del MCP Server# MCP Server - Arquitectura y Flujos
















































































































































































































































































































































































































































































































































































































































































































































































*Semana 13 - 2024-01-15***Documento Arquitectura v1.0**  ---- [Axios Docs](https://axios-http.com/)- [TypeScript Handbook](https://www.typescriptlang.org/docs/)- [Express.js Docs](https://expressjs.com/)- [JSON-RPC 2.0 Spec](https://www.jsonrpc.org/specification)## 📚 Referencias---```}  "params": { ... }  "method": "nueva_tool",{POST /rpc```json3. **Usar**:```]);  [nuevaTool.name, nuevaTool]  // ... existingconst toolRegistry = new Map([import { nuevaTool } from './nueva.tool';// src/tools/registry.ts```typescript2. **Registrar**:```};  execute: async (params) => { ... }  inputSchema: { ... },  description: '...',  name: 'nueva_tool',export const nuevaTool: MCPTool = {// src/tools/nueva.tool.ts```typescript1. **Crear archivo**:### Agregar Nueva Tool## 🔧 Extensibilidad---```# Check responses./examples.sh# Run curl examplesnpm run dev &# Start server```bash### Integración```});  });    expect(result.success).toBe(true);    // Assert    const result = await execute(params);    // Act    const params = { estado: 'PENDIENTE' };    // Arrange  it('should return verificaciones', async () => {describe('buscar_verificacion', () => {// Test tool executionjest.mock('./services/backend-client');// Mock BackendClient```typescript### Unidad## 🧪 Testabilidad---```- Cache no distribuido- BackendClient es local- No hay state compartido```### Limitaciones Actuales```                  To Clients                      │              └───────┬──────────────┘              │  (nginx / HAProxy)   │              │  Load Balancer       │◄──┘              ┌───────▼──────────────┐   │                      │                  │       └──────────────┬───┴──────────────┬───┘       │                  │                  │└──────┬──────┘   └──────┬──────┘   └──────┬──────┘│ MCP Server 1│   │ MCP Server 2│   │ MCP Server 3│┌─────────────┐   ┌─────────────┐   ┌─────────────┐```### Horizontal Scaling## 🚀 Escalabilidad---```Total response time: 100-200msBackend latency:     30-50ms (típico)Cambio de estado:    60-120msValidación estado:   40-80msBúsqueda simple:     50-100ms```### Métricas Típicas```✓ Configurable timeout✓ Async/await (non-blocking)✓ Minimal JSON parsing✓ Map para tool lookup (O(1))✓ Singleton BackendClient (reutiliza conexiones)```typescript### Optimizaciones## 📈 Performance---```✗ HTTPS (usar en gateway)✗ CORS (todo permite)✗ Rate limiting✗ Authorization (RBAC)✗ Authentication (JWT)```### No Implementado (Futuro)```✓ Required fields check✓ Enum validation✓ Range validation (limit: 1-100)✓ Business logic validation✓ JSON Schema validation✓ Type checking (TypeScript)```typescript### Validaciones Implementadas## 🔐 Seguridad---```}  fechaRegistro: string  activo: boolean  especialidad: string  email: string  nombre: string  id: stringinterface Arquitecto {```typescript### Arquitecto Entity```}  EN_PROGRESO = 'EN_PROGRESO'  RECHAZADO = 'RECHAZADO',  VERIFICADO = 'VERIFICADO',  PENDIENTE = 'PENDIENTE',enum VerificacionEstado {}  detalles?: Record<string, any>  fechaActualizacion: string    // ISO 8601  fechaCreacion: string         // ISO 8601  descripcion: string  estado: VerificacionEstado    // Enum  arquitectoId: string          // Foreign key  id: string                    // UUIDinterface Verificacion {```typescript### Verificacion Entity## 💾 Modelo de Datos---```5. Backend execution   ↓ si OK4. Business logic validation   ↓ si OK3. JSON Schema validation   ↓ si OK2. Tool exists   ↓ si OK1. JSON-RPC structure```typescript**Validaciones**:### 5. Chain of Responsibility---- No modifica código original- Agrega funcionalidad```});  next();  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);app.use((req, res, next) => {app.use(express.json());```typescript**Express Middleware**:### 4. Decorator Pattern---- Reutilizable- Crea instancia configurada```});  headers: { 'Content-Type': 'application/json' }  timeout: this.timeout,  baseURL: this.baseURL,this.httpClient = axios.create({```typescript**BackendClient**:### 3. Factory Pattern---- Dinámico- Fácil agregar nuevas- Centraliza tools```export function getTool(name: string): MCPTool | undefinedconst toolRegistry: Map<string, MCPTool> = new Map([...]);```typescript**ToolRegistry**:### 2. Registry Pattern---- Comparte timeout- Reutiliza conexiones HTTP- Una instancia compartida```export const backendClient = new BackendClient();```typescript**BackendClient**:### 1. Singleton Pattern## 🎯 Patrones de Diseño Implementados---```}  }    "data": { }               ✓ Opcional, datos adicionales    "message": "...",         ✓ String descriptivo    "code": -32000,           ✓ Integer, rango específico  "error": {  "id": "correlación",        ✓ Debe coincidir con request  "jsonrpc": "2.0",           ✓{```json### Response Error```}  "result": { ... }           ✓ Datos de la respuesta  "id": "correlación",        ✓ Debe coincidir con request  "jsonrpc": "2.0",           ✓{```json### Response Exitosa```}  "params": { "key": "value" } ✓ Opcional, object o array  "method": "tool_name",      ✓ Requerido, existente en registry  "id": "string|number",      ✓ Requerido, único para correlación  "jsonrpc": "2.0",           ✓ Requerido, exactamente "2.0"{```json### Request Valid```= Full compliance+ JSON-RPC 2.0 SpecificationRFC 7159 (JSON)```### Especificación Implementada## 🌐 JSON-RPC 2.0 Compliance---```}  throw new Error(`[BackendClient] Error: ${message}`);  const message = error.response?.data?.message || error.message;} catch (error: any) {    : response.data.data || [response.data];    ? response.data   return Array.isArray(response.data)   });    params: { ... }  const response = await this.httpClient.get('/api/verificacion/buscar', {try {// BackendClient.buscarVerificaciones()```typescript### Manejo de Errores```  Response: { status: "ok" }GET  /health  Response: { id, nombre, email, ... }GET  /api/arquitecto/{id}  Response: { id, estado, arquitectoId, ... }  Body: { estado, razon }PATCH /api/verificacion/{id}  Response: { id, estado, arquitectoId, ... }GET  /api/verificacion/{id}  Response: [{ id, estado, arquitectoId, ... }]  Query params: id, arquitectoId, estado, limit, offsetGET  /api/verificacion/buscar```### Backend Services esperados## 🔗 Conexión con Backend---**Error**: ToolResponse con success: false```}  return { success: false, error: error.message }} catch (error) {  return { success: true, data: result }  const result = await backendClient.method(...);try {// Tool las captura y convierte en ToolResponse// BackendClient.execute() lanza excepciones```typescript### Capa 5: Backend Connectivity---**Error**: ToolResponse con success: false```}  return { success: false, error: "Se requiere criterio" }if (!tieneCriterio) {// En "buscar_verificacion":}  return { success: false, error: "Ya está verificado" }if (verificacion.estado === 'VERIFICADO') {// En "cambiar_a_verificado":// Validaciones de negocio```typescript### Capa 4: Business Logic---**Error**: ToolResponse con success: false```}  return { success: false, error: "..." }if (params.estado && !validEstados.includes(params.estado)) {// Valida enums}  return { success: false, error: "..." }if (params.limit && (params.limit < 1 || params.limit > 100)) {// Valida rangos}  return { success: false, error: "..." }if (params.id && typeof params.id !== 'string') {// Valida tipos}  return { success: false, error: "..." }if (!params || typeof params !== 'object') {// Cada tool valida sus params```typescript### Capa 3: JSON Schema Validation---**Error**: -32601 (Method not found)```}  // Error -32601 (Method not found)if (!tool) {const tool = getTool(request.method);```typescript### Capa 2: Tool Exists---**Error**: -32600 (Invalid Request)```if (request.id === undefined)if (!request.method || typeof request.method !== 'string')if (!request.jsonrpc || request.jsonrpc !== '2.0')// Valida```typescript### Capa 1: JSON-RPC Structure## 📊 Validación en Capas---```}  execute  inputSchema,  description: "...",  name: "...",export const toolName: MCPTool = {// Exportasync function execute(params: any): Promise<ToolResponse<T>>// Execute functionconst inputSchema: JSONSchema = { ... }// Input schema (JSON Schema)```typescript**Estructura de cada Tool**:**Responsabilidad**: Lógica de negocio específica### 5. Tools (src/tools/*.tool.ts)---```VerificacionEstado (enum)ArquitectoVerificacion// Domain structuresToolResponse<T>JSONSchemaMCPTool// MCP structuresJSONRPCErrorCodeJSONRPCResponseJSONRPCRequest// JSON-RPC structures```typescript**Tipos Principales**:**Responsabilidad**: Definiciones TypeScript y JSON Schema### 4. Types (src/types/mcp.types.ts)---```healthCheck(): Promise<boolean>obtenerArquitecto(id): Promise<Arquitecto>cambiarEstado(id, estado, razon): Promise<Verificacion>esPendiente(id): Promise<boolean>obtenerVerificacion(id): Promise<Verificacion>buscarVerificaciones(criterios): Promise<Verificacion[]>```typescript**Métodos**:- ✅ Health check- ✅ Error handling- ✅ Timeout configurable- ✅ Singleton pattern**Características**:**Responsabilidad**: HTTP client singleton### 3. Backend Client (src/services/backend-client.ts)---```export function describeAllTools(): Record<string, any>export function hasToolByName(name: string): booleanexport function getAllTools(): MCPTool[]export function getTool(name: string): MCPTool | undefined]);  ["cambiar_a_verificado", cambiarAVerificadoTool]  ["es_pendiente", esPendienteTool],  ["buscar_verificacion", buscarVerificacionTool],const toolRegistry: Map<string, MCPTool> = new Map([```typescript**Estructura**:**Responsabilidad**: Centralizar y exponer tools### 2. Tool Registry (src/tools/registry.ts)---```-32603: Internal error-32602: Invalid params-32601: Method not found-32600: Invalid Request-32700: Parse error// JSON-RPC errors```typescript**Error Handling**:```app.get('/', handler)// Info generalapp.get('/health', handler)// Health checkapp.get('/tools', handler)// Lista toolsapp.post('/rpc', async handler)// Procesa JSON-RPC```typescript**Métodos**:**Responsabilidad**: HTTP server y orquestación JSON-RPC### 1. Server (src/server.ts)## 🛠️ Componentes Principales---```});  }    timestamp: "2024-01-15T10:30:00Z"    ],      { id: "verify-2", estado: "PENDIENTE", ... }      { id: "verify-1", estado: "PENDIENTE", ... },    data: [    success: true,  result: {  id: "req-123",  jsonrpc: "2.0",res.json({```typescript### Paso 6: Response Retorna```}  // 5. Retorna datos  // 4. Maneja errores  // 3. Parsea respuesta  // 2. axios.get('/api/verificacion/buscar?estado=PENDIENTE')  // 1. Construye URL con parámetrosasync buscarVerificaciones(criterios) {// En src/services/backend-client.ts```typescript### Paso 5: Backend Client Ejecuta```}  };    timestamp: new Date().toISOString()    data: results,    success: true,  return {  // 4. Retorna formateado    const results = await backendClient.buscarVerificaciones(params);  // 3. Llama backend    if (!['PENDIENTE', ...].includes(params.estado)) { /* error */ }  // 2. Valida criterios de negocio    if (!params.estado) { /* error */ }  // 1. Valida parámetrosasync function execute(params: any) {// Cada tool hace:```typescript### Paso 4: Ejecuta Tool```// Retorna: MCPTool instance// Busca en Map: toolRegistry.get("buscar_verificacion")const tool = getTool(request.method);// En src/tools/registry.ts```typescript### Paso 3: Localiza Tool```  // ✓ Tiene method  // ✓ Tiene id  // ✓ Tiene jsonrpc === "2.0"  // Valida estructura JSON-RPC 2.0    const request = req.body as JSONRPCRequest;app.post('/rpc', async (req: Request, res: Response) => {// En src/server.ts```typescript### Paso 2: Express Parsea```}  }    "estado": "PENDIENTE"  "params": {  "method": "buscar_verificacion",  "id": "req-123",  "jsonrpc": "2.0",{Content-Type: application/jsonPOST /rpc HTTP/1.1```typescript### Paso 1: Request Ingresa## 🔄 Flujo de Procesamiento---```                    └─────────────────────┘                    │  PostgreSQL         │                    │  (Microservicios)   │                    │  Backend Services   │                    ┌─────────────────────┐                              ▼                              │ GET/PATCH /api/verificacion                              │ REST HTTP└─────────────────────────────┼────────────────────────────────────┘│                             │                                  ││  └────────────────────────────────────────────────────────┘   ││  │  • Error handling                                      │   ││  │  • Timeout management                                  │   ││  │  • Axios instance                                      │   ││  │ Backend Client (HTTP)                                  │   ││  ┌────────────────────────────────────────────────────────┐   ││                             ▼                                  ││                             │                                  ││  └────────────────────────────────────────────────────────┘   ││  │  • Format response                                     │   ││  │  • Call BackendClient                                  │   ││  │  • Execute business logic                              │   ││  │  • Validate input schema                               │   ││  │ Tool Executor                                          │   ││  ┌────────────────────────────────────────────────────────┐   ││                             ▼                                  ││                             │                                  ││  └────────────────────────────────────────────────────────┘   ││  │  • cambiar_a_verificado                                │   ││  │  • es_pendiente                                        │   ││  │  • buscar_verificacion                                 │   ││  │ Tool Registry                                          │   ││  ┌────────────────────────────────────────────────────────┐   ││                             ▼                                  ││                             │                                  ││  └────────────────────────────────────────────────────────┘   ││  │  • Extract method and params                           │   ││  │  • Validate JSON-RPC 2.0 structure                     │   ││  │  • Parse JSON                                          │   ││  │ Request Handler                                        │   ││  ┌────────────────────────────────────────────────────────┐   ││                    MCP SERVER (Express)                        │┌───────────────────────────────────────────────────────────────┐                             ▼                             │ JSON-RPC 2.0 Request                             │ HTTP POST /rpc└────────────────────────────┬────────────────────────────────────┘│                        CLIENT (Gemini/CLI)                     │┌───────────────────────────────────────────────────────────────┐```## 📐 Arquitectura General---Documento técnico detallado sobre la arquitectura interna del MCP Server.
## 📐 Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                     USUARIO FINAL / CLIENTE                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Texto: "¿La verificación está pendiente?"
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (NestJS)                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Recibe solicitud                                      │   │
│  │ 2. Llamada a Gemini API (Google Cloud)                 │   │
│  │ 3. Gemini decide qué tool usar                         │   │
│  │ 4. Envía JSON-RPC al MCP Server                        │   │
│  │ 5. Procesa respuesta y genera respuesta final          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│    Componentes:                                                   │
│    - GeminiService (Function Calling)                            │
│    - MCPService (Client)                                         │
│    - VerificacionesController                                    │
└────────────┬───────────────────────────────────────────────────┘
             │
             │ JSON-RPC 2.0
             │ POST /rpc
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MCP SERVER (Express + TypeScript)               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   JSON-RPC Handler                       │   │
│  │                                                          │   │
│  │  - tools.list:     Listar tools                         │   │
│  │  - tools.describe: Describir tool                       │   │
│  │  - tools.call:     Ejecutar tool                        │   │
│  │  - health:         Health check                         │   │
│  └────┬─────────────────────────────────────────────────────┘   │
│       │                                                           │
│       ├─────────────────┬──────────────┬──────────────┐          │
│       ▼                 ▼              ▼              ▼          │
│  ┌─────────────┐ ┌───────────┐ ┌──────────────┐ ┌─────────┐    │
│  │ Tool 1:     │ │ Tool 2:   │ │ Tool 3:      │ │Registry │    │
│  │ Buscar      │ │ Es        │ │ Cambiar      │ │         │    │
│  │ Verif.      │ │ Pendiente │ │ Verificado   │ │ Export  │    │
│  │             │ │           │ │              │ │ Tools   │    │
│  │ - Valida    │ │ - Valida  │ │ - Valida     │ │         │    │
│  │   params    │ │   ID      │ │   params     │ │ Métodos │    │
│  │ - Llamada   │ │ - REST    │ │ - Validación │ │ públicos│    │
│  │   REST      │ │   GET     │ │   estado     │ │         │    │
│  │ - Retorna   │ │ - Retorna │ │ - REST PATCH │ │ listTools│   │
│  │   resultado │ │   boolean │ │ - Auditoría  │ │ getToolByName│
│  └─────────────┘ └───────────┘ └──────────────┘ │ isValidTool  │
│                                                  └─────────────┘
│                                                                   │
└────────────┬───────────────────────────────────────────────────┘
             │
             │ REST HTTP (GET/PATCH)
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│         MICROSERVICIO VERIFICACIÓN (NestJS/TypeORM)             │
│                                                                   │
│  ┌────────────────┐      ┌─────────────────────────────────┐   │
│  │ Controlador    │      │ BD PostgreSQL en Docker         │   │
│  │ REST           │◄────►│                                 │   │
│  │                │      │ - Tabla: verificaciones         │   │
│  │ GET /verif/{id}│      │ - Estado: pendiente/verif/rechazado │
│  │ PATCH /verif   │      │ - Auditoría de cambios          │   │
│  └────────────────┘      └─────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Ejecución: Búsqueda de Verificación

```
┌─────────────────────────────────────────────────────────────────┐
│ Usuario: "¿Dónde está la verificación de Juan?"                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────────┐
         │ API Gateway recibe texto  │
         └────────────┬──────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │ Gemini Function Calling    │
         │ - Analiza intención        │
         │ - Selecciona: buscar_verif │
         │ - Extrae: arquitecto_id    │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │ API Gateway envía JSON-RPC │
         │ {                          │
         │   "jsonrpc": "2.0",        │
         │   "method": "tools.call",  │
         │   "params": {              │
         │     "name": "buscar_verif" │
         │     "params": {            │
         │       "arquitecto_id": ".."│
         │     }                      │
         │   }                        │
         │ }                          │
         └────────────┬───────────────┘
                      │ HTTP POST /rpc
                      ▼
         ┌────────────────────────────────┐
         │ MCP Server recibe request      │
         │ - Valida JSON-RPC             │
         │ - Valida parámetros           │
         │ - Busca tool "buscar_verif"   │
         └────────────┬───────────────────┘
                      │
                      ▼
         ┌────────────────────────────────┐
         │ Tool Ejecuta:                  │
         │ - Validar UUID                 │
         │ - Llamar backend REST          │
         │ GET /verificacion?arq_id=..   │
         └────────────┬───────────────────┘
                      │
                      ▼
         ┌────────────────────────────────┐
         │ Microservicio retorna          │
         │ {                              │
         │   "id": "uuid",                │
         │   "arquitecto_id": "uuid",     │
         │   "estado": "pendiente",       │
         │   ...                          │
         │ }                              │
         └────────────┬───────────────────┘
                      │
                      ▼
         ┌────────────────────────────────┐
         │ MCP Server procesa respuesta   │
         │ - Mapea a formato JSON-RPC     │
         │ - Retorna:                     │
         │ {                              │
         │   "jsonrpc": "2.0",            │
         │   "result": {                  │
         │     "found": true,             │
         │     "verificacion": {...}      │
         │   }                            │
         │ }                              │
         └────────────┬───────────────────┘
                      │
                      ▼
         ┌────────────────────────────────┐
         │ API Gateway recibe respuesta   │
         │ - Gemini genera texto:         │
         │ "Encontré la verificación.     │
         │  Está en estado: pendiente"    │
         └────────────┬───────────────────┘
                      │
                      ▼
         ┌────────────────────────────────┐
         │ Usuario recibe respuesta       │
         └────────────────────────────────┘
```

---

## 🔄 Flujo de Ejecución: Cambiar a Verificado

```
┌──────────────────────────────────────────────────┐
│ Usuario: "Verifica la solicitud XYZ"             │
│ Moderador: "mod-001"                             │
└──────────────┬───────────────────────────────────┘
               │
               ▼
   ┌──────────────────────────────────┐
   │ Gemini decide:                   │
   │ Tool: cambiar_a_verificado       │
   │ Params: {                        │
   │   id: "xyz",                     │
   │   moderador_id: "mod-001"        │
   │ }                                │
   └──────────────┬───────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────────┐
   │ MCP Server verifica SEGURIDAD:           │
   │ 1. UUID válido? ✓                        │
   │ 2. Moderador UUID válido? ✓              │
   │ 3. Parámetros requeridos? ✓              │
   │ 4. ¿Validar pendiente? SÍ                │
   └──────────────┬──────────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────────┐
   │ Tool hace pre-validación:                │
   │ GET /verificacion/xyz                    │
   │ ¿Estado == "pendiente"? ✓                │
   └──────────────┬──────────────────────────┘
                  │ SI → Continuar
                  ▼
   ┌──────────────────────────────────────────┐
   │ Tool ejecuta cambio:                     │
   │ PATCH /verificacion/xyz                  │
   │ {                                        │
   │   "estado": "verificado",                │
   │   "moderador_id": "mod-001",             │
   │   "razon": "...",                        │
   │   "timestamp": "2024-01-06T..."          │
   │ }                                        │
   │ Headers:                                 │
   │   X-Operation: ESTADO_CHANGE             │
   │   X-Moderator-Id: mod-001                │
   └──────────────┬──────────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────────┐
   │ Backend procesa:                         │
   │ - Valida cambio                          │
   │ - Actualiza BD                           │
   │ - Registra auditoría                     │
   │ - Retorna entidad actualizada            │
   └──────────────┬──────────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────────┐
   │ MCP retorna a API Gateway:               │
   │ {                                        │
   │   "success": "true",                     │
   │   "verificacion": {                      │
   │     "id": "xyz",                         │
   │     "estado": "verificado",              │
   │     "updated_at": "2024-01-06T..."       │
   │   },                                     │
   │   "message": "Cambio exitoso"            │
   │ }                                        │
   └──────────────┬──────────────────────────┘
                  │
                  ▼
   ┌──────────────────────────────────────────┐
   │ Usuario recibe confirmación:             │
   │ "✓ Verificación actualizada a            │
   │  estado VERIFICADO"                      │
   └──────────────────────────────────────────┘
```

---

## 🔀 Diagrama de Componentes del MCP Server

```
┌─────────────────────────────────────────────────────────────────┐
│                     MCP SERVER (Express)                         │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  server.ts (Express App)                  │ │
│  │                                                            │ │
│  │  POST /rpc          ← JSON-RPC Handler                    │ │
│  │  GET /health        ← Health Check                        │ │
│  │  GET /tools         ← Tools Info                          │ │
│  │  GET /              ← Server Info                         │ │
│  └────────────────┬───────────────────────────────────────────┘ │
│                   │                                               │
│                   ▼                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              handleJsonRpc (Router)                        │ │
│  │                                                            │ │
│  │  • Valida JSON-RPC 2.0                                    │ │
│  │  • Enruta método                                          │ │
│  │  • Captura errores                                        │ │
│  │  • Retorna respuesta JSON-RPC                            │ │
│  └────────────────┬───────────────────────────────────────────┘ │
│                   │                                               │
│     ┌─────────────┼─────────────────────────┐                    │
│     │             │                         │                    │
│     ▼             ▼                         ▼                    │
│  ┌──────────┐ ┌─────────────┐ ┌──────────────────┐             │
│  │tools.list│ │tools.describe│ │tools.call        │             │
│  │          │ │              │ │                  │             │
│  │Returns: │ │Returns:      │ │Executes tool    │             │
│  │names[]  │ │schema of tool │ │Retorna result    │             │
│  └──────────┘ └─────────────┘ └──────────────────┘             │
│                                        │                         │
│                        ┌───────────────┴──────────────┐          │
│                        │                              │          │
│                        ▼                              ▼          │
│              ┌────────────────────────┐    ┌──────────────────┐ │
│              │   tools/registry.ts    │    │  tools/*.tool.ts │ │
│              │                        │    │                  │ │
│              │ - getAllTools()         │    │ Each tool:      │ │
│              │ - getToolByName()       │◄──┤ - name          │ │
│              │ - listTools()           │    │ - description   │ │
│              │ - getToolNames()        │    │ - inputSchema   │ │
│              │ - isValidToolName()     │    │ - outputSchema  │ │
│              │                        │    │ - execute()     │ │
│              └────────────────────────┘    │                  │ │
│                                            │ Tools:           │ │
│                                            │ 1. buscar_verif  │ │
│                                            │ 2. es_pendiente  │ │
│                                            │ 3. cambiar_verif │ │
│                                            └──────────────────┘ │
│                                                     │             │
│                                                     ▼             │
│                                            ┌──────────────────┐ │
│                                            │ HTTP Calls to    │ │
│                                            │ Backend Service  │ │
│                                            │                  │ │
│                                            │ axios.get()      │ │
│                                            │ axios.patch()    │ │
│                                            │                  │ │
│                                            │ Handle errors:   │ │
│                                            │ - Validation     │ │
│                                            │ - Network        │ │
│                                            │ - Backend        │ │
│                                            └──────────────────┘ │
│                                                     │             │
└─────────────────────────────────────────────────────┼─────────────┘
                                                      │
                                                      ▼
                                        ┌──────────────────────┐
                                        │  Microservicio REST  │
                                        │ (Verificación)       │
                                        └──────────────────────┘
```

---

## 📋 Matriz de Responsabilidades

| Componente | Responsabilidad |
|-----------|-----------------|
| **Usuario/Cliente** | Envía texto/intención |
| **API Gateway** | Orquesta, llama Gemini, integra MCP |
| **Gemini** | Interpreta intención, selecciona tool |
| **MCP Server** | Ejecuta tools, valida, comunica con backend |
| **Tool 1** | Busca verificación con criterios |
| **Tool 2** | Valida estado pendiente |
| **Tool 3** | Cambio de estado verificado |
| **Backend Verif.** | Acceso a BD, lógica de negocio |
| **PostgreSQL** | Persistencia de datos |

---

## 🔐 Validaciones en Cascada

```
Tool Call (JSON-RPC)
    │
    ▼
┌─────────────────────────────────────┐
│ 1. JSON-RPC Validation              │
│    ✓ jsonrpc == "2.0"               │
│    ✓ method existe                  │
│    ✓ params estructura              │
│    ✓ id presente                    │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 2. Tool Registry Validation         │
│    ✓ Tool existe                    │
│    ✓ Tool registrado                │
│    ✓ Tool tiene execute()           │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 3. Parameter Validation             │
│    ✓ Parámetros requeridos          │
│    ✓ UUID formato válido            │
│    ✓ Estados válidos                │
│    ✓ Tipos correctos                │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 4. Business Logic Validation        │
│    ✓ Entidad existe                 │
│    ✓ Permisos (si aplica)           │
│    ✓ Estado permite operación       │
│    ✓ Reglas de negocio              │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 5. Execute Tool                     │
│    ✓ Llamada HTTP                   │
│    ✓ Manejo errores network         │
│    ✓ Parse respuesta                │
│    ✓ Format resultado               │
└─────────────────┬───────────────────┘
                  │
                  ▼
            ✓ Response
```

---

## 🧪 Matriz de Casos de Prueba

| Caso | Tool | Parámetros | Esperado | Status |
|------|------|-----------|----------|--------|
| 1 | buscar_verif | id válido | ✓ retorna data | ✓ OK |
| 2 | buscar_verif | id inválido | ✗ error UUID | ✓ OK |
| 3 | buscar_verif | sin parámetros | ✗ validation error | ✓ OK |
| 4 | es_pendiente | id válido, pendiente | ✓ esPendiente=true | ✓ OK |
| 5 | es_pendiente | id válido, verificado | ✓ esPendiente=false | ✓ OK |
| 6 | es_pendiente | id inválido | ✗ error UUID | ✓ OK |
| 7 | cambiar_verif | params válidos | ✓ actualiza | ✓ OK |
| 8 | cambiar_verif | sin moderador_id | ✗ validation error | ✓ OK |
| 9 | cambiar_verif | no pendiente + validar | ✗ conflict error | ✓ OK |
| 10 | tools.list | - | ✓ lista nombres | ✓ OK |

---

## 🔗 Integración Ecosistema

```
┌─────────────────────────────────────────────────────────────┐
│                   Usuario / IA Client                        │
│                        │                                     │
│        ┌───────────────┼────────────────┐                   │
│        │               │                │                   │
│    (Web)          (Mobile)         (API)                    │
│        │               │                │                   │
└───────────────┬─────────┬────────────────┴────────────────┘
                │         │
                ▼         ▼
        ┌──────────────────────────┐
        │   API Gateway (NestJS)   │
        │   + Gemini Integration   │
        │   + MCP Client           │
        └──────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │   MCP Server (Express)   │
        │   + 3 Tools              │
        │   + JSON-RPC 2.0         │
        └──────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
    ┌─────────────┐         ┌──────────────────┐
    │ Verif Svc   │         │ Arquitecto Svc   │
    │ + PostgreSQL│         │ + PostgreSQL     │
    └─────────────┘         └──────────────────┘
        │
        ├─→ RabbitMQ (Eventos)
        ├─→ Redis (Cache/Queue)
        └─→ Webhooks (Notif)
            │
            ▼
        ┌──────────────────────┐
        │ Supabase Edge Fn     │
        │ (Serverless Logic)   │
        └──────────────────────┘
```


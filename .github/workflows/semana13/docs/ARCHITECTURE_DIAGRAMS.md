# Architecture & Flow Diagrams

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL WORLD                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐                                               │
│  │   Browser    │                                               │
│  │   / CLI      │                                               │
│  │   / App      │                                               │
│  └──────┬───────┘                                               │
│         │                                                       │
│         │ HTTP REST Requests                                   │
│         │                                                       │
│         ▼                                                       │
│  ╔═════════════════════════════════════════════════════════╗  │
│  ║  API GATEWAY (NestJS) - Port 3000                       ║  │
│  ║  ┌─────────────────────────────────────────────────┐    ║  │
│  ║  │  GeminiController                              │    ║  │
│  ║  │  • POST /api/gemini/ask                         │    ║  │
│  ║  │  • GET  /api/gemini/health                      │    ║  │
│  ║  │  • GET  /api/gemini/tools                       │    ║  │
│  ║  │  • POST /api/gemini/test                        │    ║  │
│  ║  └────────────┬───────────────────────────────────┘    ║  │
│  ║               │                                         ║  │
│  ║  ┌────────────▼───────────────────────────────────┐    ║  │
│  ║  │  GeminiService                                │    ║  │
│  ║  │  • GoogleGenerativeAI Client                  │    ║  │
│  ║  │  • Two-Phase Processing                       │    ║  │
│  ║  │  • MCP Tool Integration                       │    ║  │
│  ║  │  • Health Checks                              │    ║  │
│  ║  └────────────┬───────────────────────────────────┘    ║  │
│  ║               │                                         ║  │
│  ║  ┌────────────▼───────────────────────────────────┐    ║  │
│  ║  │  Other Modules                                │    ║  │
│  ║  │  • ArquitectoModule                           │    ║  │
│  ║  │  • VerificacionModule                         │    ║  │
│  ║  └───────────────────────────────────────────────┘    ║  │
│  ╚═════════════════════════════════════════════════════════╝  │
│         │                                     │                │
│         │ HTTP JSON-RPC                      │ HTTP            │
│         │ localhost:9000/rpc                 │ localhost:3001  │
│         │                                     │                │
│         ▼                                     ▼                │
│  ╔═════════════════════════╗        ╔════════════════════╗   │
│  ║  MCP SERVER             ║        ║  MICROSERVICES     ║   │
│  ║  (Express) - Port 9000  ║        ║  Port 3001         ║   │
│  ║                         ║        ║                    ║   │
│  ║  Tools:                 ║        ║  • Verificacion    ║   │
│  ║  • buscar_verificacion  ║        ║  • Arquitecto      ║   │
│  ║  • es_pendiente         ║        ║  • Database        ║   │
│  ║  • cambiar_a_verificado ║        ║                    ║   │
│  ║                         ║        ║                    ║   │
│  ║  Backend Client:        ║        ║                    ║   │
│  ║  • HTTP to :3001        ║        ║                    ║   │
│  ║  • Tool execution       ║        ║                    ║   │
│  ╚═════════════════════════╝        ╚════════════════════╝   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │  GOOGLE CLOUD                                        │     │
│  │  • Google Generative AI API (Gemini)                │     │
│  │  • Requires: GEMINI_API_KEY                         │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Request Flow - Two Phase Processing

### Phase 1: Analysis & Tool Decision

```
User Request
    │
    │ "¿Cuántas verificaciones pendientes hay?"
    │
    ▼
┌─────────────────────────────────────────┐
│  GeminiController                       │
│  POST /api/gemini/ask                   │
│  ├─ Validate input (AskGeminiDto)       │
│  └─ Call GeminiService.processUserRequest
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  GeminiService - Phase 1                │
│  processUserRequest()                   │
│  ├─ Prepare message                     │
│ │ ├─ Include user message               │
│ │ └─ Include tool definitions (3x)      │
│  └─ Call Gemini API                     │
└────────────────┬────────────────────────┘
                 │
         HTTP to Google Cloud
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Google Generative AI (Gemini)          │
│  • Receives message & tool definitions  │
│ • Analyzes user intent                 │
│  • Decides which tools to use           │
│  • Returns function calls               │
│    - Tool name: buscar_verificacion     │
│    - Parameters: {estado: "PENDIENTE"}  │
└────────────────┬────────────────────────┘
                 │
                 ▼
        Phase 1 Complete ✓
        → Proceed to Phase 2
```

### Phase 2: Tool Execution

```
Function Calls from Gemini
    │
    ├─ Tool: buscar_verificacion
    │  Parameters: {estado: "PENDIENTE"}
    │
    ▼
┌─────────────────────────────────────────┐
│  GeminiService - Phase 2                │
│  For each function call:                │
│  ├─ executeMCPTool(toolName, params)    │
└────────────────┬────────────────────────┘
                 │
         HTTP JSON-RPC POST /rpc
         {
           "jsonrpc": "2.0",
           "method": "buscar_verificacion",
           "params": {estado: "PENDIENTE"},
           "id": "..."
         }
                 │
                 ▼
┌─────────────────────────────────────────┐
│  MCP Server                             │
│  Receives JSON-RPC call                 │
│  ├─ Parse tool name & params            │
│  ├─ Validate params                     │
│  ├─ Execute tool                        │
│  └─ Return result                       │
│    {                                    │
│      "jsonrpc": "2.0",                  │
│      "result": [                        │
│        {id: 1, estado: "PENDIENTE"},    │
│        {id: 2, estado: "PENDIENTE"},    │
│        {id: 3, estado: "PENDIENTE"}     │
│      ],                                 │
│      "id": "..."                        │
│    }                                    │
└────────────────┬────────────────────────┘
                 │
                 ▼ (result back to API Gateway)
                 │
        Tool Execution Complete ✓
        → Proceed to Phase 3
```

### Phase 3: Response Generation

```
Tool Results (from Phase 2)
    │
    │ [
    │   {id: 1, estado: "PENDIENTE", ...},
    │   {id: 2, estado: "PENDIENTE", ...},
    │   {id: 3, estado: "PENDIENTE", ...}
    │ ]
    │
    ▼
┌─────────────────────────────────────────┐
│  GeminiService - Phase 3                │
│  • Compile all tool results             │
│  • Prepare response prompt              │
│  └─ Call Gemini API again with results  │
└────────────────┬────────────────────────┘
                 │
         HTTP to Google Cloud
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Google Generative AI (Gemini)          │
│  • Receives tool results                │
│  • Generates natural language response  │
│  • Returns text response                │
│                                         │
│  "Encontré 3 verificaciones             │
│   pendientes en el sistema:             │
│   - ID 1: ...                           │
│   - ID 2: ...                           │
│   - ID 3: ..."                          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  GeminiController                       │
│  • Format response                      │
│  • Add metadata (timestamp, tools used) │
│  └─ Return to client                    │
└────────────────┬────────────────────────┘
                 │
         HTTP JSON Response
                 │
                 ▼
         User gets answer! ✓
```

---

## 3. Tool Execution Details

### Tool 1: buscar_verificacion

```
Request to MCP Server:
{
  "jsonrpc": "2.0",
  "method": "buscar_verificacion",
  "params": {
    "estado": "PENDIENTE",
    "limit": 10
  },
  "id": "buscar_verificacion-1234567890"
}
                ↓
        MCP Server executes:
        Backend Client HTTP POST :3001
                ↓
        Returns:
        [
          {
            "id": "verif-1",
            "estado": "PENDIENTE",
            "arquitecto_id": 1,
            "descripcion": "..."
          },
          ...
        ]
```

### Tool 2: es_pendiente

```
Request to MCP Server:
{
  "jsonrpc": "2.0",
  "method": "es_pendiente",
  "params": {
    "id": "verif-123"
  },
  "id": "es_pendiente-1234567890"
}
                ↓
        MCP Server checks status
                ↓
        Returns:
        {
          "isPending": true,
          "estado": "PENDIENTE",
          "timestamp": "..."
        }
```

### Tool 3: cambiar_a_verificado

```
Request to MCP Server:
{
  "jsonrpc": "2.0",
  "method": "cambiar_a_verificado",
  "params": {
    "id": "verif-123",
    "razon": "Verificado por sistema"
  },
  "id": "cambiar_a_verificado-1234567890"
}
                ↓
        MCP Server updates status
                ↓
        Returns:
        {
          "success": true,
          "resultado": {
            "id": "verif-123",
            "estado": "VERIFICADO",
            "updated_at": "..."
          }
        }
```

---

## 4. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         API GATEWAY                                    │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │                                                               │    │
│  │  ┌────────────────────┐                                      │    │
│  │  │  User Message      │                                      │    │
│  │  │  "¿Verificaciones?"│                                      │    │
│  │  └────────┬───────────┘                                      │    │
│  │           │                                                  │    │
│  │           ▼                                                  │    │
│  │  ┌────────────────────────────────────────┐                 │    │
│  │  │  GeminiService                         │                 │    │
│  │  │                                        │                 │    │
│  │  │  Initialize Gemini Client             │                 │    │
│  │  │  ├─ API Key from env                  │                 │    │
│  │  │  └─ Create GenerativeAI instance      │                 │    │
│  │  │                                        │                 │    │
│  │  │  Load MCP Tools (3x)                  │                 │    │
│  │  │  ├─ buscar_verificacion               │                 │    │
│  │  │  ├─ es_pendiente                      │                 │    │
│  │  │  └─ cambiar_a_verificado              │                 │    │
│  │  │                                        │                 │    │
│  │  │  Phase 1: Send to Gemini              │                 │    │
│  │  │  ├─ User message                      │                 │    │
│  │  │  └─ Tool definitions (with schemas)   │                 │    │
│  │  │                                        │                 │    │
│  │  │  Gemini decides: Use buscar_verificacion              │    │
│  │  │  Return: functionCall object          │                 │    │
│  │  │                                        │                 │    │
│  │  │  Phase 2: Execute Tools               │                 │    │
│  │  │  ├─ Parse functionCall                │                 │    │
│  │  │  ├─ For each tool:                    │                 │    │
│  │  │  │  • Call executeMCPTool()           │                 │    │
│  │  │  │  • HTTP POST to :9000/rpc          │                 │    │
│  │  │  │  • Get result                      │                 │    │
│  │  │  └─ Collect all results               │                 │    │
│  │  │                                        │                 │    │
│  │  │  Phase 3: Generate Response           │                 │    │
│  │  │  ├─ Compile all tool results          │                 │    │
│  │  │  ├─ Send to Gemini with results       │                 │    │
│  │  │  ├─ Gemini generates natural language │                 │    │
│  │  │  └─ Return final response             │                 │    │
│  │  │                                        │                 │    │
│  │  └────────┬─────────────────────────────┘                 │    │
│  │           │                                                  │    │
│  │           ▼                                                  │    │
│  │  ┌────────────────────┐                                      │    │
│  │  │  Response          │                                      │    │
│  │  │  {                 │                                      │    │
│  │  │    success: true   │                                      │    │
│  │  │    response: "..." │                                      │    │
│  │  │    toolsUsed: [...]│                                      │    │
│  │  │    timestamp: ""   │                                      │    │
│  │  │  }                 │                                      │    │
│  │  └────────────────────┘                                      │    │
│  │                                                               │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Error Handling Flow

```
User Request
    │
    ▼
Try {
    │
    ├─ Validate input (AskGeminiDto)
    │  ├─ If invalid:
    │  │  └─ HttpException 400
    │  │
    │  └─ Valid ✓
    │
    ├─ Check Gemini API Key
    │  ├─ If missing:
    │  │  └─ Error logged + HttpException 500
    │  │
    │  └─ Valid ✓
    │
    ├─ Call Gemini Phase 1
    │  ├─ If timeout (>30s):
    │  │  └─ Error logged + HttpException 504
    │  ├─ If API error:
    │  │  └─ Error logged + HttpException 500
    │  │
    │  └─ Success ✓
    │
    ├─ Execute MCP Tools
    │  ├─ For each tool:
    │  │  ├─ If tool not found:
    │  │  │  └─ Continue (might be OK)
    │  │  ├─ If timeout (>15s):
    │  │  │  └─ Log error + continue
    │  │  ├─ If MCP error:
    │  │  │  └─ Log error + continue
    │  │  │
    │  │  └─ Success ✓
    │
    ├─ Call Gemini Phase 3
    │  ├─ If error:
    │  │  └─ Error logged + HttpException 500
    │  │
    │  └─ Success ✓
    │
    └─ Return GeminiAskResponse 200 OK

} Catch (Exception) {
    │
    ├─ Log error with full stack trace
    ├─ Determine error type
    │  ├─ Validation error → 400
    │  ├─ Not found → 404
    │  ├─ Timeout → 504
    │  └─ Other → 500
    │
    └─ Return error response with timestamp
}
```

---

## 6. Deployment Architecture (Future)

```
┌──────────────────────────────────────────────────────────────────┐
│                      PRODUCTION SETUP                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐      ┌──────────────┐      ┌─────────────────┐ │
│  │   Load      │      │              │      │                 │ │
│  │  Balancer   │─────▶│ API Gateway  │◀─────│  Session Store  │ │
│  │  (nginx)    │      │ (multiple    │      │  (Redis)        │ │
│  │             │      │  instances)  │      │                 │ │
│  └─────────────┘      └──────┬───────┘      └─────────────────┘ │
│                              │                                   │
│                ┌─────────────┼─────────────┐                     │
│                │             │             │                     │
│                ▼             ▼             ▼                     │
│         ┌─────────┐   ┌─────────┐   ┌─────────┐                 │
│         │ GeminiService Instance 1              │                 │
│         │ GeminiService Instance 2              │                 │
│         │ GeminiService Instance N              │                 │
│         └────────┬──────────┬──────┬────────────┘                 │
│                  │          │      │                              │
│        ┌─────────┴──────────┴──────┴─────────┐                   │
│        │                                     │                    │
│        │ Shared Resources:                   │                    │
│        │ - Gemini API (cached responses)     │                    │
│        │ - MCP Server (pool of connections) │                    │
│        │ - Database (Microservices)          │                    │
│        │                                     │                    │
│        └─────────────────────────────────────┘                    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Logging    │  │  Monitoring  │  │  Alerting    │           │
│  │  (ELK Stack) │  │ (Prometheus) │  │ (PagerDuty)  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Component Dependencies

```
GeminiController
    │
    ├─ Imports: GeminiService
    ├─ Uses: Logger (NestJS)
    ├─ Uses: AskGeminiDto
    ├─ Uses: GeminiAskResponse
    └─ HttpException (NestJS)
                            ↓
GeminiService
    │
    ├─ Imports: Injectable (NestJS)
    ├─ Imports: Logger (NestJS)
    ├─ Imports: GoogleGenerativeAI (@google/generative-ai)
    ├─ Imports: axios (HTTP client)
    ├─ Implements: getMCPTools()
    ├─ Implements: processUserRequest()
    ├─ Implements: executeMCPTool()
    ├─ Implements: healthCheck()
    ├─ Implements: initializeMCPTools()
    └─ Uses: Environment variables (process.env)
                            ↓
External Dependencies
    │
    ├─ @google/generative-ai
    │  └─ GoogleGenerativeAI class
    │
    ├─ axios
    │  └─ HTTP POST requests to MCP Server
    │
    └─ process.env
       ├─ GEMINI_API_KEY
       └─ MCP_SERVER_URL
```

---

## 8. Message Sequence Diagram

```
User        API Gateway    Gemini API    MCP Server
  │             │              │             │
  │─ ask() ────▶│              │             │
  │             │              │             │
  │             │─ Phase 1 ───▶│             │
  │             │  (analyze)   │             │
  │             │              │             │
  │             │◀─ decide ────│             │
  │             │  (tools)     │             │
  │             │              │             │
  │             │─ Phase 2 ───────────────▶│
  │             │ (execute)               │
  │             │                       │
  │             │◀─ result ─────────────│
  │             │                       │
  │             │─ Phase 3 ───▶│        │
  │             │  (respond)   │        │
  │             │              │        │
  │             │◀─ response ──│        │
  │             │              │        │
  │◀─ response ─│              │        │
  │             │              │        │

Legend:
─ = Synchronous HTTP request/response
→ = Data flow direction
◀ = Return value
```

---

## 9. Database/Microservice Interaction

```
┌─────────────────────────────────────────┐
│        MCP Server                       │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  Tool Handlers:                  │   │
│  │                                  │   │
│  │  buscar_verificacion():          │   │
│  │  ├─ Receives: estado, limit,     │   │
│  │  │           offset, etc         │   │
│  │  ├─ Calls Backend Client:        │   │
│  │  │  HTTP GET /verificaciones?... │   │
│  │  └─ Returns: Array of records    │   │
│  │                                  │   │
│  │  es_pendiente(id):               │   │
│  │  ├─ Receives: verificacion id    │   │
│  │  ├─ Calls Backend Client:        │   │
│  │  │  HTTP GET /verificaciones/{id}│   │
│  │  └─ Returns: isPending boolean   │   │
│  │                                  │   │
│  │  cambiar_a_verificado(id, razon):│  │
│  │  ├─ Receives: id, comentario     │   │
│  │  ├─ Calls Backend Client:        │   │
│  │  │  HTTP PUT /verificaciones/{id}│   │
│  │  └─ Returns: Updated record      │   │
│  │                                  │   │
│  └───────────────┬──────────────────┘   │
└────────────────┼───────────────────────┘
                 │
        HTTP to Microservices
                 │
        ┌────────┴──────────┐
        │                   │
        ▼                   ▼
   Verificacion         Arquitecto
   Microservice         Microservice
   (:3001)              (:3001)
   │                    │
   ├─ GET /verificaciones
   ├─ GET /verificaciones/{id}
   ├─ PUT /verificaciones/{id}
   ├─ POST /verificaciones
   └─ DELETE /verificaciones/{id}
   
   Database:
   ├─ Verificaciones table
   │  ├─ id (PK)
   │  ├─ estado
   │  ├─ arquitecto_id (FK)
   │  ├─ descripcion
   │  ├─ created_at
   │  └─ updated_at
   │
   └─ Arquitectos table
      ├─ id (PK)
      ├─ nombre
      ├─ email
      └─ ...
```

---

These diagrams illustrate:
1. **System Architecture** - How components are connected
2. **Request Flow** - Two-phase processing in detail
3. **Tool Execution** - Individual tool operation
4. **Data Flow** - Information movement through system
5. **Error Handling** - Exception and error paths
6. **Deployment** - Production setup (future)
7. **Dependencies** - Module relationships
8. **Message Sequence** - Timeline of interactions
9. **Microservice Integration** - Database and backend services

For more information, refer to [SETUP_GEMINI.md](../SETUP_GEMINI.md) or [api-gateway/GEMINI_INTEGRATION.md](../api-gateway/GEMINI_INTEGRATION.md)

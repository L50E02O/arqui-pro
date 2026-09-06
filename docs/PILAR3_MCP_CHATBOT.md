# [AI]  Pilar 3: MCP Chatbot Multimodal - Documentación Académica

##  Información del Proyecto

**Asignatura:** Arquitecturas de Microservicios  
**Periodo:** Segundo Parcial  
**Pilar:** 3 (Inteligencia Artificial Conversacional)  
**Peso:** 20% de la nota final  
**Fecha:** Enero 2026

---

##  Objetivos del Pilar

Implementar un asistente de inteligencia artificial conversacional que procese diferentes tipos de entrada (texto, imágenes, PDFs) y ejecute acciones de negocio mediante herramientas MCP (Model Context Protocol).

### Requisitos Cumplidos [SUCCESS] 

1. **AI Orchestrator** [SUCCESS] 
   - Microservicio que orquesta las interacciones con el modelo de lenguaje
   - Coordina LLM, MCP Tools y procesamiento multimodal
   - Implementado en FastAPI (Python 3.11)

2. **LLM Adapter abstracto** [SUCCESS] 
   - Interface que permite intercambiar proveedores de IA
   - Implementación del **Patrón Strategy**
   - Soporta: Gemini, OpenAI (Claude preparado)

3. **MCP Server con Tools** [SUCCESS] 
   - Servidor de herramientas que el modelo de IA puede invocar
   - 5 tools implementadas (requisito: mínimo 5)

4. **Chat UI / Integración** [SUCCESS] 
   - WebSocket para chat en tiempo real
   - Endpoints REST y multimodales
   - Preparado para integración con Telegram/WhatsApp vía n8n

---

## [TOOL]  Componentes Implementados

### 1. AI Orchestrator

**Ubicación:** `backend/ai-orchestrator/app/orchestrator/ai_orchestrator.py`

**Responsabilidades:**
- Recibir mensajes del usuario (texto, multimodal)
- Consultar al LLM con contexto de negocio
- Ejecutar MCP Tools según decisión del LLM
- Generar respuestas en lenguaje natural
- Gestionar WebSocket para tiempo real

**Tecnologías:**
- FastAPI 0.115.2
- Uvicorn (servidor ASGI)
- httpx (cliente HTTP async)
- Pydantic (validación)
- Loguru (logging)

**System Prompt:**
```
Eres un asistente inteligente de ArquiPro, una plataforma que conecta 
clientes con arquitectos profesionales.

Tu rol es ayudar a los usuarios con:
- Búsqueda de arquitectos por especialidad, ubicación y rating
- Consultas sobre proyectos arquitectónicos en curso
- Creación de solicitudes de proyectos
- Seguimiento de avances de proyectos
- Estadísticas y métricas de arquitectos
```

---

### 2. LLM Adapter - Patrón Strategy

**Ubicación:** `backend/ai-orchestrator/app/adapters/llm/`

#### Patrón Strategy Implementado

```python
# Clase abstracta (interface)
class LLMAdapter(ABC):
    @abstractmethod
    async def generate_text(self, prompt, ...): pass
    
    @abstractmethod
    async def generate_with_tools(self, prompt, tools, ...): pass
    
    @abstractmethod
    async def analyze_image(self, image_data, ...): pass

# Implementaciones concretas
class GeminiAdapter(LLMAdapter):
    # Implementación específica de Google Gemini
    
class OpenAIAdapter(LLMAdapter):
    # Implementación específica de OpenAI GPT

# Factory para crear instancias
class LLMFactory:
    @staticmethod
    def create_adapter(provider: str) -> LLMAdapter:
        if provider == "gemini":
            return GeminiAdapter(...)
        elif provider == "openai":
            return OpenAIAdapter(...)
```

#### Ventajas del Patrón Strategy

1. **Open/Closed Principle**: Abierto a extensión, cerrado a modificación
2. **Intercambiabilidad**: Cambiar proveedor sin modificar lógica de negocio
3. **Testabilidad**: Fácil crear mocks para testing
4. **Configurabilidad**: Cambiar proveedor desde `.env`

#### Configuración

```env
# En .env
ACTIVE_LLM_PROVIDER=gemini  # openai | gemini | claude
```

#### Proveedores Implementados

| Proveedor | Modelo | Function Calling | Vision | Status |
|-----------|--------|------------------|--------|--------|
| Gemini | gemini-1.5-pro | [SUCCESS]  | [SUCCESS]  | Implementado |
| OpenAI | gpt-4-turbo | [SUCCESS]  | [SUCCESS]  | Implementado |
| Claude | claude-3-sonnet | [SUCCESS]  | [ERROR]  | Preparado (TODO) |

---

### 3. MCP Server con Tools

**Ubicación:** `backend/ai-orchestrator/app/mcp/`

#### Arquitectura de Tools

```
MCPServer
    ├── tools: Dict[str, MCPTool]
    ├── get_available_tools() → List[Dict]
    ├── execute_tool(name, params) → Result
    └── execute_multiple_tools() → List[Result]

MCPTool (ABC)
    ├── get_name() → str
    ├── get_description() → str
    ├── get_parameters() → JSON Schema
    ├── get_required_permissions() → List[str]
    └── execute(**kwargs) → Dict
```

#### Tools Implementadas (5 obligatorias)

##### Tool 1: buscar_arquitectos (Consulta) [SEARCH] 

**Tipo:** Consulta  
**Endpoint:** `GET /api/v1/arquitectos`  
**Permisos:** cliente, arquitecto, moderador

**Parámetros:**
```python
{
    "especialidad": str (opcional),
    "ubicacion": str (opcional),
    "rating_min": float 1-5 (opcional),
    "verificado": bool (opcional)
}
```

**Retorna:**
```python
{
    "arquitectos": [
        {
            "id": "uuid",
            "nombre": "string",
            "especialidad": "string",
            "ubicacion": "string",
            "rating": 4.5,
            "verificado": true
        }
    ],
    "total": int,
    "filtros_aplicados": {...}
}
```

**Caso de Uso:**
```
Usuario: "Busca arquitectos especializados en diseño moderno en Bogotá"
→ AI ejecuta: buscar_arquitectos(especialidad="moderno", ubicacion="Bogotá")
→ Retorna 3 arquitectos
→ AI responde: "Encontré 3 arquitectos especializados en diseño moderno..."
```

---

##### Tool 2: obtener_proyecto (Consulta) [LIST] 

**Tipo:** Consulta  
**Endpoint:** `GET /api/v1/proyectos/:id`  
**Permisos:** cliente, arquitecto, moderador

**Parámetros:**
```python
{
    "proyecto_id": str (UUID, requerido)
}
```

**Retorna:**
```python
{
    "proyecto": {
        "id": "uuid",
        "nombre": "string",
        "estado": "en_progreso | completado | pendiente",
        "cliente": {...},
        "arquitecto": {...},
        "avances": [...],
        "incidencias": [...]
    }
}
```

**Caso de Uso:**
```
Usuario: "¿Cómo va el proyecto abc-123?"
→ AI ejecuta: obtener_proyecto(proyecto_id="abc-123")
→ Analiza estado, avances
→ AI responde: "Tu proyecto está al 75% completado. Último avance..."
```

---

##### Tool 3: crear_solicitud (Acción) ️

**Tipo:** Acción  
**Endpoint:** `POST /api/v1/solicitudes_proyecto`  
**Permisos:** cliente, moderador

**Parámetros:**
```python
{
    "cliente_id": str (UUID, requerido),
    "arquitecto_id": str (UUID, requerido),
    "descripcion": str (requerido),
    "presupuesto": float (requerido),
    "plazo_dias": int (requerido),
    "ubicacion": str (opcional)
}
```

**Retorna:**
```python
{
    "solicitud": {
        "id": "uuid",
        "estado": "pendiente",
        "created_at": "ISO8601"
    },
    "mensaje": "Solicitud de proyecto creada exitosamente"
}
```

**Caso de Uso:**
```
Usuario: "Quiero solicitar un proyecto al arquitecto Juan Pérez, 
          para remodelación de mi casa, presupuesto 50 millones, 
          plazo 3 meses"
→ AI confirma datos
→ AI ejecuta: crear_solicitud(
      cliente_id=current_user,
      arquitecto_id=...,
      descripcion="Remodelación de casa",
      presupuesto=50000000,
      plazo_dias=90
  )
→ AI responde: "¡Solicitud creada! El arquitecto recibirá notificación..."
```

---

##### Tool 4: publicar_avance (Acción) [STATS] 

**Tipo:** Acción  
**Endpoint:** `POST /api/v1/avances`  
**Permisos:** arquitecto, moderador

**Parámetros:**
```python
{
    "proyecto_id": str (UUID, requerido),
    "arquitecto_id": str (UUID, requerido),
    "descripcion": str (requerido),
    "porcentaje": int 0-100 (requerido)
}
```

**Retorna:**
```python
{
    "avance": {
        "id": "uuid",
        "proyecto_id": "uuid",
        "porcentaje": 75,
        "descripcion": "string",
        "created_at": "ISO8601"
    },
    "mensaje": "Avance publicado: 75% completado"
}
```

**Caso de Uso:**
```
Usuario (arquitecto): "Publica avance del proyecto xyz-789: 
                       Terminé los planos estructurales, 60% completado"
→ AI ejecuta: publicar_avance(
      proyecto_id="xyz-789",
      descripcion="Terminé los planos estructurales",
      porcentaje=60
  )
→ Cliente recibe notificación automática
```

---

##### Tool 5: estadisticas_arquitecto (Reporte) [METRICS] 

**Tipo:** Reporte  
**Endpoint:** GraphQL `estadisticasArquitecto` o agregación REST  
**Permisos:** arquitecto, moderador, cliente

**Parámetros:**
```python
{
    "arquitecto_id": str (UUID, requerido)
}
```

**Retorna:**
```python
{
    "arquitecto_id": "uuid",
    "kpis": {
        "proyectos_completados": 25,
        "proyectos_activos": 3,
        "rating_promedio": 4.7,
        "ingresos_totales": 150000000,
        "tiempo_promedio_dias": 65
    }
}
```

**Caso de Uso:**
```
Usuario: "Muéstrame las estadísticas del arquitecto María López"
→ AI ejecuta: estadisticas_arquitecto(arquitecto_id=...)
→ AI responde: "María López tiene 25 proyectos completados, 
                rating de 4.7/5, y tiempo promedio de entrega de 65 días"
```

---

### 4. Procesamiento Multimodal

**Ubicación:** `backend/ai-orchestrator/app/multimodal/processors.py`

#### Tipos Soportados (mínimo 2 obligatorios)

##### 1. Texto (Obligatorio) [SUCCESS] 

**Entrada:** String  
**Procesamiento:** Directo al LLM  
**Uso:** Comandos y consultas en lenguaje natural

```python
# Ejemplo
message = "Busca arquitectos en Medellín"
→ AI procesa directamente
```

---

##### 2. Imagen (OCR) [SUCCESS] 

**Formatos:** JPG, JPEG, PNG, WebP  
**Motor:** Tesseract OCR  
**Procesamiento:**
1. Extracción de texto (OCR)
2. Análisis con LLM Vision (si disponible)

```python
# Flujo
imagen.jpg → ImageProcessor → OCR 
→ Texto extraído → Agregado al prompt
→ LLM analiza contexto
```

**Casos de Uso:**
- OCR de documentos (contratos, planos)
- Clasificación de fotos de proyectos
- Análisis de bocetos arquitectónicos

**Ejemplo:**
```
Usuario: [Sube foto de plano] "¿Este plano cumple normas sismorresistentes?"
→ OCR extrae medidas y anotaciones
→ AI con knowledge base analiza
→ Responde con validaciones
```

---

##### 3. PDF [SUCCESS] 

**Procesamiento:**
1. Extracción de texto con PyPDF2
2. Extracción de tablas con pdfplumber (opcional)
3. Metadatos del documento

```python
# Flujo
contrato.pdf → PDFProcessor → Extrae texto + metadatos
→ Agregado al prompt (limitado a 2000 chars)
→ LLM procesa
```

**Casos de Uso:**
- Extracción de datos de facturas
- Análisis de contratos
- Procesamiento de catálogos

**Ejemplo:**
```
Usuario: [Sube contrato.pdf] "Extrae el presupuesto acordado"
→ PDF → Texto
→ AI encuentra: "Presupuesto: $50.000.000 COP"
→ Responde con datos estructurados
```

---

##### 4. Audio (BONUS - no implementado) 

**Status:** Placeholder  
**Tecnología propuesta:** OpenAI Whisper  
**Uso:** Transcripción de notas de voz

---

##  Seguridad Implementada

### 1. Control de Permisos por Tool

```python
# Cada tool define roles permitidos
class CrearSolicitudTool(MCPTool):
    def get_required_permissions(self) -> List[str]:
        return ["cliente", "moderador"]  # Solo estos roles

# Validación automática
async def safe_execute(self, user_role: str, **kwargs):
    if not self.validate_permissions(user_role):
        return {"success": False, "error": "Sin permisos"}
```

### 2. Rate Limiting

```env
MAX_REQUESTS_PER_USER_PER_MINUTE=10
MAX_TOOL_EXECUTIONS_PER_REQUEST=5
```

### 3. Validación de Entradas

- Pydantic valida todos los requests
- JSON Schema para parámetros de tools
- Validación de tipos y rangos

### 4. Manejo de Errores

```python
try:
    result = await tool.execute(**params)
except Exception as e:
    logger.error(f"Error: {e}")
    return fallback_response
```

---

## [SIGNAL]  Endpoints API

### Chat Texto

```http
POST /api/v1/chat

{
  "message": "Busca arquitectos en Bogotá",
  "user_id": "uuid",
  "context": {"rol": "cliente"}
}

→ Response: ChatResponse con tools_executed
```

### Chat Multimodal

```http
POST /api/v1/chat/multimodal
Content-Type: multipart/form-data

- message: string
- user_id: string
- file: image/pdf

→ Response: ChatResponse con análisis del archivo
```

### WebSocket Real-time

```
WS /ws/chat/{user_id}

Client → Server:
{
  "type": "message",
  "content": "texto"
}

Server → Client:
{
  "type": "response",
  "content": "respuesta IA",
  "tools_executed": [...]
}
```

---

## [TEST]  Testing y Demostración

### Test 1: Búsqueda de Arquitectos

```bash
curl -X POST http://localhost:8001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Busca arquitectos especializados en minimalismo en Medellín con rating mayor a 4",
    "user_id": "test-user",
    "context": {"rol": "cliente"}
  }'
```

**Esperado:**
- AI invoca `buscar_arquitectos`
- Retorna lista de arquitectos
- Respuesta en lenguaje natural

---

### Test 2: Crear Solicitud

```bash
curl -X POST http://localhost:8001/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quiero solicitar un proyecto al arquitecto Juan, presupuesto 30 millones, 60 días",
    "user_id": "cliente-123",
    "context": {"rol": "cliente"}
  }'
```

**Esperado:**
- AI confirma datos (nombre complejo)
- Ejecuta `crear_solicitud`
- Confirma creación

---

### Test 3: Análisis de Imagen

```bash
# Con curl
curl -X POST http://localhost:8001/api/v1/chat/multimodal \
  -F "message=¿Qué dice este documento?" \
  -F "user_id=test-user" \
  -F "file=@plano.jpg"
```

**Esperado:**
- OCR extrae texto
- AI analiza contenido
- Responde con interpretación

---

### Test 4: WebSocket Chat

```javascript
const socket = new WebSocket('ws://localhost:8001/ws/chat/user-123');

socket.onopen = () => {
  socket.send(JSON.stringify({
    type: 'message',
    content: 'Hola, necesito ayuda',
    conversation_id: 'conv-1'
  }));
};

socket.onmessage = (event) => {
  const response = JSON.parse(event.data);
  console.log(response.content);  // Respuesta del AI
};
```

---

## [METRICS]  Métricas y Observabilidad

### Logging Estructurado

```
2026-01-15 10:30:00 | INFO | [CHAT]  Procesando mensaje de user-123
2026-01-15 10:30:01 | INFO | [TOOL]  LLM invocó 1 tools
2026-01-15 10:30:01 | INFO | [TOOL]  Ejecutando tool: buscar_arquitectos
2026-01-15 10:30:02 | INFO | [SUCCESS]  Tool ejecutada: buscar_arquitectos (245ms)
```

### Métricas de Performance

```python
# Incluidas en cada ChatResponse
{
  "tools_executed": [
    {
      "tool_name": "buscar_arquitectos",
      "execution_time_ms": 245.5,
      "success": true
    }
  ]
}
```

---

##  Sustentación Académica

### Patrones de Diseño Aplicados

1. **Strategy Pattern** (LLM Adapters)
   - Permite intercambiar algoritmos en runtime
   - Cumple Open/Closed Principle
   - Facilita testing y extensibilidad

2. **Factory Pattern** (LLMFactory)
   - Encapsula creación de objetos complejos
   - Centraliza lógica de instanciación

3. **Template Method** (MCPTool base class)
   - Define estructura común de tools
   - Permite sobrescribir pasos específicos

4. **Observer Pattern** (WebSocket)
   - Notificación push a clientes
   - Desacoplamiento emisor-receptor

### Principios SOLID

- **S** - Single Responsibility: Cada clase tiene una responsabilidad clara
- **O** - Open/Closed: Extensible sin modificar código existente
- **L** - Liskov Substitution: Adapters son intercambiables
- **I** - Interface Segregation: Interfaces específicas (LLMAdapter, MCPTool)
- **D** - Dependency Inversion: Dependemos de abstracciones, no implementaciones

### Arquitectura de Microservicios

- **Separación de responsabilidades**: AI en servicio independiente
- **Comunicación async**: httpx para Rails API
- **Escalabilidad horizontal**: FastAPI soporta concurrencia
- **Resilencia**: Fallbacks ante errores de LLM o tools

---

##  Referencias Bibliográficas

1. **Patrón Strategy**  
   Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.

2. **FastAPI Documentation**  
   Ramírez, S. (2024). FastAPI. https://fastapi.tiangolo.com/

3. **OpenAI Function Calling**  
   OpenAI. (2024). Function calling. https://platform.openai.com/docs/guides/function-calling

4. **Google Gemini API**  
   Google AI. (2024). Gemini API Documentation. https://ai.google.dev/docs

5. **Model Context Protocol (MCP)**  
   Anthropic. (2024). Model Context Protocol Specification.

---

## [SUCCESS]  Checklist de Requisitos

### Componentes Obligatorios

- [x] AI Orchestrator implementado
- [x] LLM Adapter con patrón Strategy
- [x] MCP Server funcional
- [x] Chat UI / WebSocket
- [x] Documentación completa

### Multimodalidad (mínimo 2)

- [x] Texto (obligatorio)
- [x] Imagen (OCR con Tesseract)
- [x] PDF (PyPDF2 + pdfplumber)
- [ ] Audio (BONUS - no requerido)

### MCP Tools (mínimo 5)

- [x] buscar_arquitectos (Consulta)
- [x] obtener_proyecto (Consulta)
- [x] crear_solicitud (Acción)
- [x] publicar_avance (Acción)
- [x] estadisticas_arquitecto (Reporte)

### Calidad de Código

- [x] Código documentado
- [x] Type hints (Python)
- [x] Manejo de errores
- [x] Logging estructurado
- [x] README completo

---

##  Conclusiones

El Pilar 3 implementa exitosamente un **sistema de IA conversacional empresarial** con:

1. **Arquitectura profesional**: Microservicio desacoplado, escalable
2. **Patrones de diseño**: Strategy, Factory, Template Method aplicados correctamente
3. **Multimodalidad avanzada**: OCR, PDFs, análisis de imágenes
4. **Integración real**: Consume APIs existentes del primer parcial
5. **Seguridad**: Control de permisos, rate limiting, validación

El sistema no es solo un chatbot de preguntas-respuestas, sino un **agente inteligente** capaz de ejecutar acciones reales en el negocio, demostrando aplicación práctica de IA generativa en entornos empresariales.

---

**Desarrollado por:** [Tu Nombre/Equipo]  
**Fecha:** Enero 2026  
**Repositorio:** https://github.com/tu-usuario/arqui-pro

# [START]  Guía de Inicio Rápido - AI Orchestrator

##  Instalación Rápida (5 minutos)

### Paso 1: Requisitos Previos

```powershell
# Verificar Python
python --version  # Debe ser 3.11+

# Instalar Tesseract OCR
# Windows: Descargar de https://github.com/UB-Mannheim/tesseract/wiki
# Instalar en: C:\Program Files\Tesseract-OCR\
```

### Paso 2: Instalar Dependencias

```powershell
cd backend\ai-orchestrator

# Crear entorno virtual
python -m venv venv

# Activar (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Instalar
pip install -r requirements.txt
```

### Paso 3: Configurar API Key

```powershell
# Copiar archivo de configuración
cp .env.example .env

# Editar .env y agregar tu API key de Gemini
# Conseguir gratis en: https://aistudio.google.com/app/apikey
```

En `.env`:
```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
ACTIVE_LLM_PROVIDER=gemini
```

### Paso 4: Iniciar Servidor

```powershell
python main.py
```

[SUCCESS]  **Listo!** Servidor corriendo en: `http://localhost:8001`

---

## [TEST]  Probar el Sistema

### Opción 1: Health Check

```powershell
curl http://localhost:8001/health
```

### Opción 2: Test Automático

```powershell
python test_orchestrator.py
```

### Opción 3: Test Manual

```powershell
curl -X POST http://localhost:8001/api/v1/chat `
  -H "Content-Type: application/json" `
  -d '{
    "message": "Hola, ¿qué puedes hacer?",
    "user_id": "test-user"
  }'
```

---

## [CHAT]  Ejemplos de Uso

### Ejemplo 1: Buscar Arquitectos

**Request:**
```json
POST /api/v1/chat

{
  "message": "Busca arquitectos en Medellín con rating mayor a 4",
  "user_id": "cliente-123",
  "context": {"rol": "cliente"}
}
```

**Response:**
```json
{
  "content": "Encontré 3 arquitectos en Medellín con rating superior a 4...",
  "tools_executed": [
    {
      "tool_name": "buscar_arquitectos",
      "params": {"ubicacion": "Medellín", "rating_min": 4},
      "success": true
    }
  ]
}
```

### Ejemplo 2: Estadísticas

**Request:**
```json
POST /api/v1/chat

{
  "message": "Muéstrame las estadísticas del arquitecto María López",
  "user_id": "moderador-456",
  "context": {"rol": "moderador"}
}
```

**Response:**
```json
{
  "content": "María López tiene:\n- 25 proyectos completados\n- Rating: 4.7/5...",
  "tools_executed": [
    {
      "tool_name": "estadisticas_arquitecto",
      "result": {
        "proyectos_completados": 25,
        "rating_promedio": 4.7
      }
    }
  ]
}
```

### Ejemplo 3: Crear Solicitud

**Request:**
```json
POST /api/v1/chat

{
  "message": "Quiero solicitar un proyecto al arquitecto Juan, presupuesto 30 millones, plazo 60 días",
  "user_id": "cliente-789",
  "context": {"rol": "cliente"}
}
```

---

## [MULTIMODAL]  Usar Multimodal (Imagen/PDF)

### Con imagen:

```powershell
curl -X POST http://localhost:8001/api/v1/chat/multimodal `
  -F "message=¿Qué dice este plano?" `
  -F "user_id=test-user" `
  -F "file=@plano.jpg"
```

### Con PDF:

```powershell
curl -X POST http://localhost:8001/api/v1/chat/multimodal `
  -F "message=Extrae datos del contrato" `
  -F "user_id=test-user" `
  -F "file=@contrato.pdf"
```

---

## [TOOL]  Comandos Útiles

### Ver herramientas disponibles

```powershell
curl http://localhost:8001/api/v1/tools
```

### Ejecutar tool directamente

```powershell
curl -X POST http://localhost:8001/api/v1/tools/buscar_arquitectos/execute `
  -H "Content-Type: application/json" `
  -d '{"ubicacion": "Bogotá"}'
```

### Ver logs en tiempo real

```powershell
# Los logs aparecen en la consola donde ejecutaste main.py
```

---

## ️ Configuración Avanzada

### Cambiar a OpenAI

En `.env`:
```
OPENAI_API_KEY=sk-proj-XXXXXXXXX
ACTIVE_LLM_PROVIDER=openai
```

### Habilitar/Deshabilitar Tools

En `.env`:
```
ENABLED_TOOLS=buscar_arquitectos,obtener_proyecto,estadisticas_arquitecto
# Solo se habilitarán estas 3
```

### Ajustar Rate Limiting

En `.env`:
```
MAX_REQUESTS_PER_USER_PER_MINUTE=20  # Default: 10
MAX_TOOL_EXECUTIONS_PER_REQUEST=10   # Default: 5
```

---

##  Solución de Problemas

### Error: "GEMINI_API_KEY no configurada"

**Solución:**
```powershell
# Edita .env y agrega tu API key
GEMINI_API_KEY=AIzaSy...
```

### Error: "Tesseract not found"

**Solución:**
```powershell
# Instala Tesseract y configura la ruta en .env
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
```

### Error: "Connection refused to Rails API"

**Solución:**
```powershell
# Asegúrate de que Rails esté corriendo
cd backend/APIREST
rails server -p 3000
```

### El LLM no ejecuta tools

**Posibles causas:**
1. El prompt no es claro → Reformula con palabras clave
2. Tool deshabilitada → Verifica `ENABLED_TOOLS` en `.env`
3. Permisos insuficientes → Agrega `context.rol` en el request

---

##  Documentación Completa

- **README principal:** [README.md](README.md)
- **Documentación académica:** [../docs/PILAR3_MCP_CHATBOT.md](../docs/PILAR3_MCP_CHATBOT.md)
- **API Reference:** Ver comentarios en `main.py`

---

##  Para la Defensa del Proyecto

### Demostración Sugerida

1. **Mostrar health check** (30 seg)
2. **Listar tools** (30 seg)
3. **Chat simple** - Sin tools (1 min)
4. **Búsqueda con tool** - buscar_arquitectos (2 min)
5. **Multimodal** - OCR de imagen (2 min)
6. **Código del patrón Strategy** (2 min)

**Total: ~8 minutos**

### Puntos Clave a Mencionar

1. [SUCCESS]  **Patrón Strategy** para LLM adapters
2. [SUCCESS]  **5 MCP Tools** (2 consulta + 2 acción + 1 reporte)
3. [SUCCESS]  **Multimodal** (texto, imagen OCR, PDF)
4. [SUCCESS]  **Integración** con Rails API existente
5. [SUCCESS]  **WebSocket** para chat en tiempo real
6. [SUCCESS]  **Seguridad** (permisos, rate limiting)

---

##  Contribución

Este es el **Pilar 3** del proyecto universitario ArquiPro.

**Desarrollado por:** [Tu Equipo]  
**Curso:** Arquitecturas de Microservicios  
**Fecha:** Enero 2026

---

**¿Necesitas ayuda?** Revisa la documentación completa en [README.md](README.md)

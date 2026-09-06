# AI Orchestrator - Microservicio de IA Conversacional y MCP

El microservicio de Inteligencia Artificial Conversacional implementa un agente inteligente multimodal capaz de ejecutar acciones de negocio en la plataforma mediante el estandar Model Context Protocol (MCP).

---

## Capacidades Principales

- **Chat en lenguaje natural:** Integracion con LLMs (Gemini, OpenAI, Groq).
- **Herramientas MCP:** Ejecucion de acciones operativas (busqueda de arquitectos, creacion de solicitudes, registro de avances, generacion de metricas).
- **Procesamiento multimodal:** Analisis de texto, imagenes (OCR mediante Tesseract) y documentos PDF.
- **Canal WebSocket en tiempo real:** Comunicacion bidireccional de baja latencia con el cliente web.
- **Patron Strategy:** Desacoplamiento e intercambio dinamico del proveedor de modelos de lenguaje.

---

## Arquitectura de Componentes

```text
[Cliente Web / WebSocket]
          │
          ▼
[AI Orchestrator (FastAPI)]
   ├── [LLM Adapters (Strategy Pattern)] -> Gemini / OpenAI / Groq
   ├── [MCP Server] ---------------------> Herramientas de negocio
   ├── [Multimodal Processor] -----------> OCR y extraccion PDF
   └── [Backend Client] -----------------> Consumo de Rails API REST
```

---

## Requisitos Previos

- Python 3.10 o superior
- Tesseract OCR (para procesamiento multimodal de imagenes)
  - Ubuntu/Debian: `sudo apt-get install tesseract-ocr tesseract-ocr-spa`
  - Arch Linux: `sudo pacman -S tesseract tesseract-data-spa`
  - macOS: `brew install tesseract tesseract-lang`
- Llave de API para el modelo (Gemini, OpenAI o Groq)

---

## Guia de Instalacion y Ejecucion

### 1. Entorno Virtual y Dependencias

```bash
cd backend/ai-orchestrator
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Variables de Entorno

Crear un archivo `.env` basado en la configuracion de ejemplo:

```bash
cp .env.example .env
```

Configurar las credenciales necesarias en `.env`:
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=tu_clave_gemini
APIREST_URL=http://localhost:3000
PORT=8001
```

### 3. Puesta en Marcha

```bash
uvicorn main:app --reload --port 8001
```

---

## Herramientas MCP Registradas

| Herramienta | Tipo | Descripcion |
| :--- | :--- | :--- |
| `buscar_arquitectos` | Consulta | Filtra arquitectos por especialidad, ubicacion y calificacion. |
| `obtener_proyecto` | Consulta | Retorna el detalle completo y estado de un proyecto. |
| `crear_solicitud` | Accion | Genera una nueva solicitud de contratacion o presupuesto. |
| `crear_avance` | Accion | Registra un nuevo avance de obra con notas e imagenes. |
| `estadisticas_arquitecto` | Analitica | Consolida metricas de desempeno y proyectos del profesional. |

---

## Verificacion y Pruebas

Para ejecutar las pruebas de integracion del orquestador:

```bash
pytest test_orchestrator.py
```

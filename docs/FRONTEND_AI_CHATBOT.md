# [AI]  Integración Frontend AI Chatbot - ArquiPro

## [LIST]  Descripción

Integración del **AI Orchestrator** (Pilar 3) en el frontend de ArquiPro. Asistente inteligente multimodal con capacidades de procesamiento de texto, imágenes y PDFs.

## [MULTIMODAL]  Componentes Creados

### 1️⃣ **AIChat.tsx** - Componente Principal
**Ubicación:** `frontend/src/components/AIChat.tsx`

Componente de interfaz de chat con IA que incluye:
- [SUCCESS]  Mensajes de texto en tiempo real
- [SUCCESS]  Carga de archivos (imágenes JPG/PNG/WebP y PDFs)
- [SUCCESS]  Visualización de tools ejecutadas (MCP Tools)
- [SUCCESS]  Indicadores de carga y estado de conexión
- [SUCCESS]  Preview de archivos antes de enviar
- [SUCCESS]  Auto-scroll y animaciones fluidas

**Props:**
```typescript
interface AIChatProps {
  userId: string;
  userRole?: 'cliente' | 'arquitecto' | 'moderador';
  onClose?: () => void;
  enableWebSocket?: boolean; // true: WebSocket, false: HTTP polling
}
```

**Ejemplo de uso:**
```tsx
import AIChat from '../components/AIChat';

<AIChat 
  userId="user-123"
  userRole="arquitecto"
  enableWebSocket={true}
/>
```

---

### 2️⃣ **AIChatFloat.tsx** - Botón Flotante
**Ubicación:** `frontend/src/components/AIChatFloat.tsx`

Botón flotante con 2 modos de operación:
- **`float`**: Abre modal superpuesto con el chat
- **`redirect`**: Navega a la página dedicada `/ai-chat`

**Props:**
```typescript
interface AIChatFloatProps {
  userId: string;
  userRole?: 'cliente' | 'arquitecto' | 'moderador';
  mode?: 'float' | 'redirect'; // Default: 'float'
}
```

**Ejemplo de uso:**
```tsx
import AIChatFloat from '../components/AIChatFloat';

// En cualquier layout o página:
<AIChatFloat 
  userId={user.id}
  userRole={user.role}
  mode="float"
/>
```

---

### 3️⃣ **AIChatPage.tsx** - Página Dedicada
**Ubicación:** `frontend/src/pages/AIChatPage.tsx`

Página full-screen para el chat con IA. Ideal para sesiones de trabajo extensas.

**Ruta:** `/ai-chat`

---

##  Hooks Personalizados

### **useAIChat** - Gestión de Estado y Comunicación
**Ubicación:** `frontend/src/hooks/useAIChat.ts`

Hook que maneja toda la lógica del chat con IA:

```typescript
const {
  messages,           // AIMessage[] - Historial de mensajes
  isLoading,          // boolean - Estado de carga
  isConnected,        // boolean - WebSocket conectado
  error,              // string | null - Mensajes de error
  sendMessage,        // (message: string) => Promise<void>
  sendMultimodalMessage, // (message: string, file: File) => Promise<void>
  clearMessages       // () => void
} = useAIChat({
  userId: 'user-123',
  conversationId: 'conv-456', // Opcional
  userRole: 'arquitecto',
  enableWebSocket: true
});
```

**Tipos de datos:**
```typescript
interface AIMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  tools_executed?: ToolExecution[];
  llm_provider?: string;
  isLoading?: boolean;
}

interface ToolExecution {
  tool_name: string;
  params: Record<string, any>;
  result: any;
  success: boolean;
  execution_time_ms: number;
}
```

---

## ️ Servicios

### **aiChatService** - Cliente HTTP/WebSocket
**Ubicación:** `frontend/src/services/api/aiChatService.ts`

Servicio para comunicarse con el AI Orchestrator (puerto 8001):

```typescript
import aiChatService from '../services/api/aiChatService';

// Health check
await aiChatService.healthCheck();

// Enviar mensaje de texto
const response = await aiChatService.sendMessage({
  message: "Busca arquitectos en Bogotá especializados en casas modernas",
  user_id: "user-123",
  context: { rol: "cliente" }
});

// Enviar mensaje multimodal (con archivo)
const response = await aiChatService.sendMultimodalMessage(
  "Analiza este plano arquitectónico",
  "user-123",
  imageFile
);

// Obtener tools disponibles
const tools = await aiChatService.getAvailableTools();

// Crear WebSocket
const ws = aiChatService.createWebSocket("user-123");
```

---

## [MULTIMODAL]  Estilos y Variables CSS

Todos los estilos usan el **sistema de diseño existente** definido en `variables.css`:

### Variables utilizadas:
```css
/* Colores */
--color-primary: #007bff
--color-success: #28a745
--color-danger: #dc3545
--color-gray-100 a --color-gray-600

/* Espaciado */
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px

/* Tipografía */
--font-size-xs: 0.75rem
--font-size-sm: 0.875rem
--font-size-base: 1rem
--font-size-lg: 1.125rem
--font-size-xl: 1.25rem

/* Sombras */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15)

/* Bordes */
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-full: 9999px

/* Transiciones */
--transition-fast: 150ms ease
--transition-base: 250ms ease
```

### Archivos de estilos:
- **AIChat.css** - Estilos del componente de chat
- **AIChatPage.css** - Estilos de la página dedicada
- **AIChatFloat.css** - Estilos del botón flotante

---

## [START]  Instalación y Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en `frontend/` basado en `.env.example`:

```bash
# AI Orchestrator (Backend Pilar 3)
VITE_AI_ORCHESTRATOR_URL=http://localhost:8001

# Otros servicios existentes
VITE_API_URL=http://localhost:3000
VITE_GRAPHQL_URL=http://localhost:8000/graphql
VITE_WEBSOCKET_URL=http://localhost:3006
```

### 2. Ruta en App.tsx

La ruta ya está configurada en [App.tsx](../src/App.tsx):

```tsx
import AIChatPage from './pages/AIChatPage';

// En Routes:
<Route path="/ai-chat" element={<AIChatPage />} />
```

### 3. Agregar Botón Flotante (Opcional)

Puedes agregar el botón flotante en cualquier layout:

```tsx
// En ClienteLayout.tsx, ArquitectoLayout.tsx, etc.
import AIChatFloat from '../components/AIChatFloat';
import { useAuth } from '../contexts/AuthContext';

function Layout() {
  const { user } = useAuth();
  
  return (
    <div>
      {/* Tu contenido actual */}
      
      {/* Botón flotante del AI Chat */}
      {user && (
        <AIChatFloat 
          userId={user.id}
          userRole={user.rol}
          mode="float"
        />
      )}
    </div>
  );
}
```

---

##  Características Principales

### [SUCCESS]  Multimodal
- Procesa **texto**, **imágenes** (OCR) y **PDFs**
- Preview de archivos antes de enviar
- Validación de tipos (JPG, PNG, WebP, PDF) y tamaño (10MB max)

### [SUCCESS]  MCP Tools Visualization
Cuando la IA ejecuta herramientas, se muestra:
- Nombre de la tool
- Tiempo de ejecución en ms
- Estado (éxito o error)
- Parámetros y resultados

### [SUCCESS]  Real-time con WebSocket
- Conexión persistente con AI Orchestrator
- Indicador de estado (conectado/desconectado)
- Typing indicators mientras procesa

### [SUCCESS]  Responsive Design
- Desktop: Modal de 450px × 650px
- Mobile: Full-screen adaptativo
- Tablet: Tamaños intermedios

### [SUCCESS]  Accesibilidad
- ARIA labels en botones
- Soporte para teclado (Enter para enviar)
- Alto contraste y lectores de pantalla

---

## [TOOL]  Personalización

### Cambiar el modelo LLM

El modelo se configura en el **backend** (AI Orchestrator):

```python
# backend/ai-orchestrator/.env
LLM_PROVIDER=gemini  # o "openai"
GEMINI_MODEL=gemini-1.5-pro
OPENAI_MODEL=gpt-4-turbo-preview
```

### Modificar estilos

Edita las variables CSS en [variables.css](../src/styles/variables.css):

```css
:root {
  --color-primary: #FF6B6B; /* Cambiar color primario */
  --spacing-lg: 32px;       /* Ajustar espaciado */
}
```

### Agregar funciones personalizadas

Extiende el servicio `aiChatService.ts`:

```typescript
// En services/api/aiChatService.ts
async customQuery(query: string) {
  const response = await axios.post(`${this.baseURL}/api/v1/custom`, {
    query
  });
  return response.data;
}
```

---

## [TEST]  Testing

### Probar conexión con AI Orchestrator

```typescript
import aiChatService from './services/api/aiChatService';

// En console del navegador:
const health = await aiChatService.healthCheck();
console.log('AI Status:', health);

const tools = await aiChatService.getAvailableTools();
console.log('Available Tools:', tools);
```

### Verificar WebSocket

```typescript
const ws = aiChatService.createWebSocket('test-user');

ws.onopen = () => console.log('[SUCCESS]  WebSocket conectado');
ws.onmessage = (e) => console.log(' Mensaje:', JSON.parse(e.data));
ws.onerror = (e) => console.error('[ERROR]  Error:', e);
```

---

## [METRICS]  Flujo de Datos

```
┌─────────────┐
│   Usuario   │
│  (Frontend) │
└──────┬──────┘
       │ Input (texto/archivo)
       ▼
┌──────────────────┐
│   AIChat.tsx     │
│  useAIChat()     │
└──────┬───────────┘
       │
       ├─ HTTP ────────┐
       │               ▼
       │         ┌──────────────┐
       │         │ aiChatService│
       │         │  (REST API)  │
       │         └───────┬──────┘
       │                 │
       │ WebSocket ──────┤
       │                 ▼
       │         ┌────────────────┐
       └────────▶│ AI Orchestrator│ :8001
                 │   (FastAPI)    │
                 └────────┬───────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
         ┌────────┐  ┌────────┐  ┌────────┐
         │ Gemini │  │OpenAI  │  │MCP Tools│
         │  API   │  │  API   │  │(5 tools)│
         └────────┘  └────────┘  └────────┘
```

---

##  Seguridad

### Autenticación
El `userId` se obtiene del contexto de autenticación:

```tsx
import { useAuth } from '../contexts/AuthContext';

const { user } = useAuth();

<AIChat userId={user.id} userRole={user.rol} />
```

### Rate Limiting
El backend implementa límites de tasa por usuario (configurado en AI Orchestrator).

### Validación de Archivos
- Tipos permitidos: JPG, PNG, WebP, PDF
- Tamaño máximo: 10MB
- Validación en frontend y backend

---

##  Troubleshooting

### El chat no conecta

1. Verifica que el AI Orchestrator esté corriendo:
   ```bash
   # En backend/ai-orchestrator/
   uvicorn main:app --port 8001 --reload
   ```

2. Revisa la variable de entorno:
   ```bash
   echo $VITE_AI_ORCHESTRATOR_URL  # Debe ser http://localhost:8001
   ```

3. Comprueba el health check:
   ```bash
   curl http://localhost:8001/health
   ```

### WebSocket no conecta

1. Verifica CORS en backend:
   ```python
   # main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. Revisa la URL del WebSocket (debe usar `ws://` no `http://`):
   ```typescript
   // aiChatService.ts
   const wsUrl = this.baseURL.replace('http', 'ws');
   ```

### Archivos no se procesan

1. Verifica las API keys en el backend:
   ```bash
   # backend/ai-orchestrator/.env
   GEMINI_API_KEY=tu_api_key_aqui
   ```

2. Comprueba que Tesseract esté instalado (para OCR):
   ```bash
   tesseract --version
   ```

---

##  Recursos Adicionales

- **Documentación Backend:** [backend/ai-orchestrator/README.md](../../backend/ai-orchestrator/README.md)
- **Guía Rápida:** [backend/ai-orchestrator/QUICK_START.md](../../backend/ai-orchestrator/QUICK_START.md)
- **Documentación Académica:** [docs/PILAR3_MCP_CHATBOT.md](../../docs/PILAR3_MCP_CHATBOT.md)

---

##  Próximos Pasos

1. **Agregar el botón flotante** a los layouts existentes
2. **Configurar las variables de entorno** (`.env`)
3. **Iniciar el AI Orchestrator** (puerto 8001)
4. **Probar el chat** navegando a `/ai-chat`

---

## [GROUP]  Contacto

Para dudas o soporte sobre esta integración, contacta al equipo de desarrollo de ArquiPro.

---

[SUCCESS]  **¡Integración completada con éxito!**

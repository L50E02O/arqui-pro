# [START]  Inicio Rápido - AI Chatbot Frontend

## ⏱️ 5 Minutos de Configuración

### 1️⃣ Variables de Entorno (1 min)

Crea `.env` en `frontend/`:

```bash
cp .env.example .env
```

Edita `.env`:
```bash
VITE_AI_ORCHESTRATOR_URL=http://localhost:8001
```

---

### 2️⃣ Iniciar Backend AI (2 min)

```bash
cd backend/ai-orchestrator

# Crear virtualenv (primera vez)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias (primera vez)
pip install -r requirements.txt

# Configurar .env con API keys
cp .env.example .env
# Editar .env con tu GEMINI_API_KEY

# Iniciar servidor
uvicorn main:app --port 8001 --reload
```

[SUCCESS]  Verifica: http://localhost:8001/health debe responder con `{"status": "healthy"}`

---

### 3️⃣ Iniciar Frontend (2 min)

```bash
cd frontend

# Instalar dependencias (primera vez, si no lo has hecho)
npm install

# Iniciar desarrollo
npm run dev
```

[SUCCESS]  Abre: http://localhost:5173

---

##  Uso Básico

### Opción 1: Botón Flotante (Recomendado)

Ya está integrado en `ClienteLayout.tsx`. Solo inicia sesión como cliente y verás el botón flotante en la esquina inferior derecha.

### Opción 2: Página Dedicada

Navega manualmente a: http://localhost:5173/ai-chat

### Opción 3: Agregar a Otros Layouts

```tsx
// En ArquitectoLayout.tsx, MainLayout.tsx, etc.
import AIChatFloat from '../../AIChatFloat';
import { useAuth } from '../../../contexts/AuthContext';

function Layout() {
  const { user } = useAuth();
  
  return (
    <div>
      {/* Tu contenido */}
      
      {user && (
        <AIChatFloat 
          userId={user.id}
          userRole={user.rol}
          mode="float"  // o "redirect" para navegar a /ai-chat
        />
      )}
    </div>
  );
}
```

---

## [NOTE]  Pruebas Rápidas

### Consultas de Texto

1. Click en el botón flotante (bot icon)
2. Escribe: "Busca arquitectos en Bogotá especializados en casas modernas"
3. Observa cómo ejecuta la tool `buscar_arquitectos`

### Consultas con Imágenes

1. Click en el icono de clip [ATTACH] 
2. Selecciona una imagen (JPG, PNG, WebP)
3. Escribe: "Analiza esta imagen arquitectónica"
4. Envía

### Consultas con PDFs

1. Click en el icono de clip [ATTACH] 
2. Selecciona un PDF (max 10MB)
3. Escribe: "Resume este documento"
4. Envía

---

## [SEARCH]  Verificación de Funcionamiento

### Health Check desde el navegador

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Importar el servicio manualmente (en consola)
const response = await fetch('http://localhost:8001/health');
const health = await response.json();
console.log('AI Health:', health);

// Verificar tools disponibles
const toolsRes = await fetch('http://localhost:8001/api/v1/tools');
const tools = await toolsRes.json();
console.log('Available Tools:', tools);
```

---

##  Solución Rápida de Problemas

### [ERROR]  "Cannot connect to AI Orchestrator"

**Solución:**
```bash
# Verifica que el backend esté corriendo
curl http://localhost:8001/health

# Si no responde, reinicia:
cd backend/ai-orchestrator
uvicorn main:app --port 8001 --reload
```

### [ERROR]  "WebSocket connection failed"

**Causa:** CORS no configurado correctamente

**Solución:** Verifica en `backend/ai-orchestrator/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### [ERROR]  "Missing API Key"

**Solución:** Configura tu API key en `backend/ai-orchestrator/.env`:
```bash
# Para Gemini (gratis)
GEMINI_API_KEY=tu_api_key_aqui

# O para OpenAI (de pago)
OPENAI_API_KEY=tu_api_key_aqui
LLM_PROVIDER=openai
```

Obtén API key de Gemini: https://aistudio.google.com/app/apikey

### [ERROR]  Botón flotante no aparece

**Solución:** Verifica que el usuario esté autenticado:
```tsx
// El componente AIChatFloat solo se muestra si hay un user
{user && <AIChatFloat userId={user.id} />}
```

---

## [METRICS]  Ejemplo de Conversación

```
[USER]  Usuario: "Busca arquitectos en Medellín que trabajen en estilo minimalista"

[AI]  IA: "Encontré 3 arquitectos en Medellín especializados en minimalismo:

1. **Arq. María González** 
   - ⭐ 4.8/5 (23 proyectos completados)
   - Especialidad: Minimalismo, Sostenibilidad
   - Disponibilidad: [SUCCESS]  Disponible

2. **Arq. Carlos Hernández**
   - ⭐ 4.6/5 (18 proyectos)
   - Especialidad: Minimalismo, Arquitectura contemporánea
   - Disponibilidad: ⏳ Parcialmente disponible

3. **Arq. Laura Pérez**
   - ⭐ 4.9/5 (31 proyectos)
   - Especialidad: Minimalismo japonés, Feng Shui
   - Disponibilidad: [SUCCESS]  Disponible

[TOOL]  Herramientas ejecutadas:
• buscar_arquitectos (250ms) [OK] "
```

---

## [MULTIMODAL]  Personalización Rápida

### Cambiar Colores

Edita `frontend/src/styles/variables.css`:
```css
:root {
  --color-primary: #FF6B6B; /* Rojo coral */
  --color-success: #51CF66; /* Verde menta */
}
```

### Cambiar Posición del Botón

Edita `frontend/src/styles/AIChatFloat.css`:
```css
.ai-chat-float-btn {
  bottom: 20px;  /* Cambiar altura */
  right: 20px;   /* Cambiar lado (o usa 'left') */
}
```

### Habilitar/Deshabilitar WebSocket

```tsx
<AIChat 
  userId={user.id}
  enableWebSocket={false}  // Usa HTTP polling en lugar de WS
/>
```

---

## [STATS]  Próximos Pasos

1. [SUCCESS]  Verificar health del backend
2. [SUCCESS]  Probar envío de mensajes
3. [SUCCESS]  Probar carga de imágenes
4. [SUCCESS]  Revisar tools ejecutadas
5.  Agregar a otros layouts (Arquitecto, Moderador)
6.  Personalizar estilos
7.  Configurar analytics/tracking

---

##  Documentación Completa

- **Frontend:** [FRONTEND_AI_CHATBOT.md](./FRONTEND_AI_CHATBOT.md)
- **Backend:** [../backend/ai-orchestrator/README.md](../backend/ai-orchestrator/README.md)
- **Académica:** [PILAR3_MCP_CHATBOT.md](./PILAR3_MCP_CHATBOT.md)

---

##  Soporte

Si encuentras problemas:

1. Revisa logs del backend:
   ```bash
   cd backend/ai-orchestrator
   tail -f logs/app.log
   ```

2. Revisa consola del navegador (F12)

3. Verifica network tab (solicitudes HTTP/WS)

---

[SUCCESS]  **¡Listo! El AI Chatbot está funcionando.**

Prueba enviando: *"Hola, muéstrame qué puedes hacer"*

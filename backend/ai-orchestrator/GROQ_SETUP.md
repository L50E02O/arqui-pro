# [START]  Groq API - LLM Gratis y Ultrarrápido

## ¿Qué es Groq?

**Groq** es una API completamente **GRATUITA** que ofrece modelos de IA de última generación con velocidad ultrarrápida. Ideal para estudiantes y proyectos universitarios.

## [SUCCESS]  Ventajas de Groq

- **100% Gratis** - Sin tarjeta de crédito
- **Ultrarrápido** - Hardware especializado (LPU)
- **Buenos modelos** - Llama3, Mixtral, Gemma
- **API simple** - Compatible con OpenAI
- **Sin límites** - 30 req/min, 6000 tokens/min (gratis)

## [BATCH]  Obtener API Key

### Paso 1: Crear cuenta
1. Ve a: https://console.groq.com
2. Regístrate con tu email (no necesitas tarjeta)
3. Confirma tu correo

### Paso 2: Generar API Key
1. En el dashboard, ve a: https://console.groq.com/keys
2. Click en **"Create API Key"**
3. Dale un nombre (ej: "ArquiPro")
4. Copia la key que empieza con `gsk_...`

[WARN]  **IMPORTANTE**: Guarda la key, solo se muestra una vez.

## [TOOL]  Configurar en ArquiPro

### Editar `.env`
Abre `backend/ai-orchestrator/.env` y reemplaza:

```env
# Pega tu API key aquí
GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GROQ_MODEL=llama3-8b-8192
ACTIVE_LLM_PROVIDER=groq
```

### Reiniciar servidor

```powershell
# En la terminal del AI Orchestrator
# Presiona Ctrl+C para detener
python main.py
```

Deberías ver:
```
[SUCCESS]  Groq configurado: modelo=llama3-8b-8192
```

##  Modelos Disponibles

| Modelo | Velocidad | Calidad | Uso |
|--------|-----------|---------|-----|
| `llama3-8b-8192` |  Ultrarrápido | ⭐⭐⭐ Buena | **Recomendado** |
| `llama3-70b-8192` |  Rápido | ⭐⭐⭐⭐ Excelente | Respuestas complejas |
| `mixtral-8x7b-32768` |  Rápido | ⭐⭐⭐⭐ Excelente | Contexto largo |
| `gemma-7b-it` |  Ultrarrápido | ⭐⭐ Regular | Tareas simples |

Para cambiar modelo, edita en `.env`:
```env
GROQ_MODEL=llama3-70b-8192
```

## [SUCCESS]  Verificar funcionamiento

1. Reinicia el servidor AI Orchestrator
2. Abre el frontend (http://localhost:5174)
3. Abre el chat flotante
4. Envía: "Hola, ¿cómo funciona el sistema?"

Deberías ver una respuesta instantánea de Llama3.

##  Comparación con otras APIs

| Aspecto | Groq (Llama3) | OpenAI (GPT-3.5) | Gemini | Ollama |
|---------|---------------|------------------|--------|---------|
| **Costo** | Gratis | $0.002/1K tokens | Gratis limitado | Gratis |
| **Velocidad** |  Ultra |  Rápido |  Rápido |  Lento |
| **Calidad** | ⭐⭐⭐ Buena | ⭐⭐⭐⭐ Muy buena | ⭐⭐⭐⭐ Muy buena | ⭐⭐⭐ Buena |
| **Límites** | 30 req/min | Por pago | Cuotas diarias | Sin límites |
| **Internet** | Necesario | Necesario | Necesario | No necesario |
| **Setup** | 2 minutos | Requiere pago | Complejo | Instalación local |

## [NOTE]  Tips

### Tokens por minuto
- Tier gratuito: **6,000 tokens/min**
- Suficiente para demos y pruebas
- Para más: https://wow.groq.com (plan PRO)

### Request por minuto
- **30 requests/min** gratis
- Perfecto para chatbot universitario
- Si necesitas más, espacia las peticiones

### Context window
- `llama3-8b`: 8,192 tokens
- `llama3-70b`: 8,192 tokens
- `mixtral`: 32,768 tokens (conversaciones largas)

##  Solución de Problemas

### Error: "GROQ_API_KEY no configurada"
- Verifica que copiaste la key completa en `.env`
- La key debe empezar con `gsk_`
- No uses comillas en el valor

### Error: "Rate limit exceeded"
- Esperaste 1 minuto
- Tier gratis: 30 requests/min
- Reduce frecuencia de mensajes

### Respuestas lentas
- Cambia de modelo a `llama3-8b-8192`
- Verifica tu conexión a internet
- Groq generalmente es ultrarrápido

##  Recursos

- **Console**: https://console.groq.com
- **Documentación**: https://console.groq.com/docs
- **Playground**: https://console.groq.com/playground
- **Modelos**: https://console.groq.com/docs/models

##  Para tu proyecto universitario

Groq es **PERFECTO** para Pilar 3 porque:

[SUCCESS]  Cumple con requisito de "LLM con Strategy pattern"  
[SUCCESS]  API profesional sin costo  
[SUCCESS]  Velocidad impresionante para demos  
[SUCCESS]  Modelos de calidad (Llama3 ≈ GPT-3.5)  
[SUCCESS]  No necesitas explicar por qué no usas GPT-4   

---

¡Listo para usar! 

**Siguiente paso:** Obtén tu API key en https://console.groq.com/keys

# Configuración de Logs en Supabase para n8n

## Resumen

Se ha implementado un sistema completo para guardar los logs del workflow de n8n en Supabase:

1. **Tabla `sistema_logs`** en Supabase
2. **Modelo `SistemaLog`** en Rails
3. **Controlador `SistemaLogsController`** con autenticación por API Key
4. **Endpoint REST** `/api/v1/sistema_logs`
5. **Workflow de n8n actualizado** para enviar logs automáticamente

## Pasos de Configuración

### 1. Ejecutar la Migración

```bash
cd backend/APIREST
rails db:migrate
```

Esto creará la tabla `sistema_logs` en Supabase con los siguientes campos:
- `id` (UUID)
- `tipo` (string) - Tipo de log (ej: "cleanup-tokens")
- `mensaje` (text) - Mensaje formateado del log
- `datos` (jsonb) - Datos completos en formato JSON
- `estado` (string) - "exito" o "error"
- `fecha_ejecucion` (timestamp) - Fecha de ejecución del workflow
- `created_at`, `updated_at` (timestamps)

### 2. Configurar Variable de Entorno

Agrega la variable `N8N_API_KEY` en el archivo `.env` de la API REST:

```env
# En backend/APIREST/.env
N8N_API_KEY=ace791da1fb0765e56a6063803e27577afee631a5a7c716eecfe37188fa3b26e
```

**Importante**: Debe ser la misma API Key que configuraste en:
- `backend/auth-microservicio/.env`
- Variables de entorno de n8n

### 3. Reiniciar la API REST

Después de agregar la variable de entorno, reinicia el servidor Rails:

```bash
cd backend/APIREST
rails server
```

### 4. Actualizar el Workflow en n8n

1. Importa el workflow actualizado desde `docs/n8n-workflow-cleanup-tokens.json`
2. O manualmente agrega un nodo "HTTP Request" después de "Formatear Log":
   - **URL**: `http://host.docker.internal:4000/api/v1/sistema_logs`
   - **Method**: `POST`
   - **Headers**: 
     - `X-API-Key`: `={{ $env.N8N_API_KEY }}`
     - `Content-Type`: `application/json`
   - **Body** (JSON):
     ```json
     {
       "log": {
         "tipo": "{{ $json.tipo }}",
         "mensaje": "{{ $json.message }}",
         "datos": {{ $json.data }},
         "estado": "{{ $json.estado }}",
         "fecha_ejecucion": "{{ $json.timestamp }}"
       }
     }
     ```

## Endpoints Disponibles

### POST /api/v1/sistema_logs
Crea un nuevo log (requiere API Key en header `X-API-Key`)

**Request:**
```json
{
  "log": {
    "tipo": "cleanup-tokens",
    "mensaje": "[2026-01-16T00:55:40.152Z] Limpieza de tokens completada...",
    "datos": {
      "success": true,
      "deleted": {
        "revoked_tokens": 0,
        "refresh_tokens": 0,
        "total": 0
      }
    },
    "estado": "exito",
    "fecha_ejecucion": "2026-01-16T00:55:40.152Z"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Log guardado correctamente",
  "id": "uuid-del-log"
}
```

### GET /api/v1/sistema_logs
Lista logs (requiere autenticación de moderador)

**Query Parameters:**
- `tipo` - Filtrar por tipo de log
- `estado` - Filtrar por estado ("exito" o "error")
- `dias` - Filtrar últimos N días
- `page` - Número de página (default: 1)
- `per_page` - Elementos por página (default: 20)

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "tipo": "cleanup-tokens",
      "mensaje": "...",
      "datos": {...},
      "estado": "exito",
      "fecha_ejecucion": "2026-01-16T00:55:40.152Z",
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "total": 100,
  "page": 1,
  "per_page": 20
}
```

### GET /api/v1/sistema_logs/:id
Obtiene un log específico (requiere autenticación de moderador)

## Verificación

### Probar el Endpoint Manualmente

```bash
curl -X POST http://localhost:4000/api/v1/sistema_logs \
  -H "X-API-Key: ace791da1fb0765e56a6063803e27577afee631a5a7c716eecfe37188fa3b26e" \
  -H "Content-Type: application/json" \
  -d "{\"log\":{\"tipo\":\"test\",\"mensaje\":\"Test log\",\"datos\":{},\"estado\":\"exito\",\"fecha_ejecucion\":\"2026-01-16T00:00:00Z\"}}"
```

### Verificar en Supabase

1. Accede a tu proyecto de Supabase
2. Ve a "Table Editor"
3. Busca la tabla `sistema_logs`
4. Deberías ver los logs guardados

## Estructura de la Tabla

```sql
CREATE TABLE sistema_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR NOT NULL,
  mensaje TEXT NOT NULL,
  datos JSONB,
  estado VARCHAR NOT NULL CHECK (estado IN ('exito', 'error')),
  fecha_ejecucion TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_sistema_logs_tipo ON sistema_logs(tipo);
CREATE INDEX idx_sistema_logs_estado ON sistema_logs(estado);
CREATE INDEX idx_sistema_logs_fecha_ejecucion ON sistema_logs(fecha_ejecucion);
```

## Notas

- Los logs se guardan automáticamente cada vez que se ejecuta el workflow
- Solo moderadores pueden ver los logs (endpoints GET)
- El endpoint POST está protegido con API Key (mismo que n8n)
- Los logs incluyen toda la información de la ejecución del workflow

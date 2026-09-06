# Pilar 4: n8n Event Bus - Tareas Programadas

## Descripción General

Este documento describe la implementación del Pilar 4 del sistema de microservicios, que utiliza **n8n** como Event Bus para ejecutar tareas programadas (Cron Jobs) que automatizan procesos del sistema.

## Arquitectura

```
n8n (Schedule Trigger) 
    ↓
API Gateway (NestJS)
    ↓
Auth Microservicio (NestJS)
    ↓
Base de Datos (PostgreSQL/Supabase)
```

### Flujo de Datos

1. **n8n** ejecuta un workflow programado (Cron) cada 24 horas
2. El workflow realiza una petición HTTP POST al **API Gateway** en `/auth/cleanup-tokens`
3. El **API Gateway** hace proxy de la petición al **Auth Microservicio**
4. El **Auth Microservicio** valida la API Key y ejecuta la limpieza de tokens expirados
5. Se retorna un reporte con estadísticas de la limpieza realizada

## Configuración e Instalación

### 1. Configurar Variables de Entorno

#### Auth Microservicio

Agrega la siguiente variable en `backend/auth-microservicio/.env`:

```env
# API Key para servicios externos (n8n)
N8N_API_KEY=tu-api-key-segura-aqui-minimo-32-caracteres
```

**Importante**: Genera una API Key segura de al menos 32 caracteres. Puedes usar:

```bash
# Generar API Key aleatoria (Linux/Mac)
openssl rand -hex 32

# O usar un generador online de UUIDs
```

#### n8n (Docker Compose)

El archivo `docker-compose.yml` ya está configurado. Solo necesitas crear un archivo `.env` en la raíz del proyecto si quieres personalizar:

```env
# Contraseña para acceso básico a n8n
N8N_PASSWORD=tu-password-segura

# Host donde se accederá a n8n (opcional)
N8N_HOST=localhost
```

### 2. Levantar n8n con Docker

```bash
# Desde la raíz del proyecto
docker-compose up -d n8n
```

Esto iniciará n8n en `http://localhost:5678`


### 3. Importar el Workflow

1. Accede a n8n: `http://localhost:5678`
2. Inicia sesión con las credenciales
3. Ve a **Workflows** → **Import from File**
4. Selecciona el archivo `/cronJob.json`
5. El workflow se importará con todos los nodos configurados

### 4. Configurar Variables de Entorno en n8n

1. En el workflow importado, ve a **Settings** → **Environment Variables**
2. Agrega la variable:
   - **Name**: `N8N_API_KEY`
   - **Value**: La misma API Key que configuraste en el Auth Microservicio

**Alternativa**: Puedes editar el nodo "HTTP Request - Limpiar Tokens" y reemplazar `={{ $env.N8N_API_KEY }}` con la API Key directamente (menos seguro).

### 5. Activar el Workflow

1. En el workflow importado, haz clic en el botón **Active** (toggle) en la esquina superior derecha
2. El workflow comenzará a ejecutarse según el schedule configurado (cada 24 horas)

## Endpoint de Limpieza de Tokens

### Descripción

El endpoint `/auth/cleanup-tokens` elimina tokens expirados de la base de datos:
- **Tokens revocados expirados**: Tokens que fueron revocados y ya expiraron
- **Refresh tokens expirados**: Refresh tokens que ya pasaron su fecha de expiración

### Especificación

**URL**: `POST /auth/cleanup-tokens`

**Headers**:
```
X-API-Key: tu-api-key-segura
Content-Type: application/json
```

**Autenticación**: Requiere API Key válida en el header `X-API-Key`

**Respuesta Exitosa** (200 OK):
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "deleted": {
    "revoked_tokens": 150,
    "refresh_tokens": 45,
    "total": 195
  },
  "found": {
    "expired_revoked_tokens": 150,
    "expired_refresh_tokens": 45
  }
}
```

**Respuesta de Error** (401 Unauthorized):
```json
{
  "statusCode": 401,
  "message": "API Key inválida"
}
```

### Implementación

El endpoint está implementado en:
- **Controller**: `backend/auth-microservicio/src/auth/auth.controller.ts`
- **Service**: `backend/auth-microservicio/src/auth/auth.service.ts`
- **Guard**: `backend/auth-microservicio/src/auth/guards/api-key.guard.ts`

## Workflow de n8n

### Estructura del Workflow

El workflow `n8n-workflow-cleanup-tokens.json` contiene los siguientes nodos:

1. **Schedule Trigger**: Se ejecuta cada 24 horas
2. **HTTP Request**: Realiza POST a `/auth/cleanup-tokens` con API Key
3. **If Node**: Verifica si la operación fue exitosa
4. **Set Node** (Error): Maneja errores y los formatea
5. **Merge Node**: Combina datos para logging
6. **Code Node**: Formatea el mensaje de log
7. **Write File Node**: Escribe logs a archivo (opcional, deshabilitado por defecto)

### Personalización del Schedule

Para cambiar la frecuencia de ejecución:

1. Abre el nodo **Schedule Trigger**
2. Selecciona el tipo de intervalo:
   - **Every Hour**: Cada hora
   - **Every Day**: Cada día (configuración actual)
   - **Every Week**: Cada semana
   - **Cron Expression**: Expresión cron personalizada

**Ejemplo de expresiones cron comunes**:
- `0 2 * * *` - Todos los días a las 2:00 AM
- `0 */6 * * *` - Cada 6 horas
- `0 0 * * 0` - Cada domingo a medianoche

### Modificar la URL del Gateway

Si el API Gateway no está en `http://gateway:3000`, edita el nodo **HTTP Request**:

- **URL**: Cambia `http://gateway:3000` por la URL correcta
  - Desarrollo local: `http://localhost:3000`
  - Docker: `http://gateway:3000` (nombre del servicio)
  - Producción: `https://api.tudominio.com`

## Pruebas

### Probar el Endpoint Manualmente

```bash
# Usando curl
curl -X POST http://localhost:3000/auth/cleanup-tokens \
  -H "X-API-Key: tu-api-key-segura" \
  -H "Content-Type: application/json"

# Usando HTTPie
http POST http://localhost:3000/auth/cleanup-tokens \
  X-API-Key:tu-api-key-segura
```

### Probar el Workflow en n8n

1. Abre el workflow en n8n
2. Haz clic en **Execute Workflow** (botón de play)
3. Revisa la ejecución en **Executions**
4. Verifica que el nodo HTTP Request retorne un status 200 con datos de limpieza

## Monitoreo y Logs

### Logs del Auth Microservicio

El servicio registra las ejecuciones del endpoint. Revisa los logs para ver:
- Peticiones recibidas
- Errores de autenticación
- Resultados de la limpieza

### Logs de n8n

1. Ve a **Executions** en n8n
2. Revisa las ejecuciones del workflow
3. Haz clic en una ejecución para ver detalles de cada nodo

### Habilitar Logging a Archivo

Para guardar logs en archivo:

1. Edita el workflow en n8n
2. Habilita el nodo **Write File Node**
3. Configura la ruta donde se guardarán los logs
4. Asegúrate de que n8n tenga permisos de escritura en esa ruta

## Seguridad

### API Key

- **Nunca** commitees la API Key en el repositorio
- Usa variables de entorno para almacenar la clave
- Genera una clave segura de al menos 32 caracteres
- Rota la clave periódicamente en producción

### Red

- En producción, asegúrate de que n8n y el API Gateway estén en la misma red privada
- No expongas n8n públicamente sin autenticación
- Usa HTTPS en producción

### Rate Limiting

El endpoint está protegido por el throttler de NestJS (10 requests/minuto global). Para tareas programadas, esto es suficiente.

## Troubleshooting

### Error: "API Key inválida"

- Verifica que la variable `N8N_API_KEY` esté configurada en el Auth Microservicio
- Verifica que el header `X-API-Key` en n8n coincida exactamente
- Revisa que no haya espacios extra en la API Key

### Error: "Connection refused" en n8n

- Verifica que el API Gateway esté corriendo
- Verifica la URL en el nodo HTTP Request
- Si usas Docker, asegúrate de que ambos servicios estén en la misma red

### El workflow no se ejecuta automáticamente

- Verifica que el workflow esté activo (toggle en la esquina superior)
- Revisa la configuración del Schedule Trigger
- Verifica los logs de n8n para errores

### No se eliminan tokens

- Verifica que haya tokens expirados en la base de datos
- Revisa los logs del Auth Microservicio para errores
- Verifica la conexión a la base de datos

## Extensión: Agregar Más Tareas Programadas

Para agregar más tareas programadas:

1. Crea un nuevo endpoint en el microservicio correspondiente
2. Protege el endpoint con `ApiKeyGuard`
3. Crea un nuevo workflow en n8n o agrega nodos al existente
4. Configura el Schedule Trigger según la frecuencia deseada

**Ejemplo**: Reporte diario de proyectos
- Endpoint: `POST /api/v1/proyectos/generar-reporte-diario`
- Workflow: Nuevo workflow con Schedule diario
- Acción: Genera y envía reporte por email

## Referencias

- [Documentación de n8n](https://docs.n8n.io/)
- [n8n Schedule Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)
- [NestJS Guards](https://docs.nestjs.com/guards)

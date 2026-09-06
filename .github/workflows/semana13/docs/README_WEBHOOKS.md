# 🚀 Guía Completa: Configuración y Prueba del Sistema de Webhooks

Esta guía te llevará paso a paso para configurar y probar todo el sistema de webhooks con Serverless Functions.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación](#instalación)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Configuración de Supabase](#configuración-de-supabase)
5. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
6. [Iniciar los Servicios](#iniciar-los-servicios)
7. [Probar el Sistema](#probar-el-sistema)
8. [Monitoreo y Verificación](#monitoreo-y-verificación)
9. [Troubleshooting](#troubleshooting)

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js** 18+ y npm
- ✅ **Docker** y Docker Compose
- ✅ **Git**
- ✅ **Cuenta de Supabase** (gratuita): https://supabase.com
- ✅ **Cuenta de Resend o SendGrid** (para emails): https://resend.com o https://sendgrid.com

---

## 🔧 Instalación

### Paso 1: Clonar/Verificar el Proyecto

```bash
cd 2parcial/semana12
```

### Paso 2: Instalar Dependencias

```bash
# Microservicio Arquitecto
cd microservicio-arquitecto
npm install
cd ..

# Microservicio Verificación
cd microservicio-verificacion
npm install
cd ..
```

### Paso 3: Iniciar Servicios con Docker Compose

```bash
# Desde la raíz del proyecto (2parcial/semana12)
docker-compose up -d
```

Esto iniciará:
- ✅ PostgreSQL para Arquitecto (puerto 5433)
- ✅ PostgreSQL para Verificación (puerto 5434)
- ✅ RabbitMQ (puerto 5672, UI en 15672)
- ✅ Redis (puerto 6379)

**Verificar que los servicios estén corriendo:**
```bash
docker-compose ps
```

---

## 🗄️ Configuración de Base de Datos

### Paso 1: Ejecutar Migraciones

```bash
# Microservicio Arquitecto
cd microservicio-arquitecto
npm run migration:run
cd ..

# Microservicio Verificación
cd microservicio-verificacion
npm run migration:run
cd ..
```

---

## ☁️ Configuración de Supabase

### Paso 1: Crear Proyecto en Supabase

1. Ve a https://supabase.com y crea una cuenta (si no tienes)
2. Crea un nuevo proyecto
3. Anota:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Service Role Key**: Se encuentra en Settings → API → service_role key

### Paso 2: Las Tablas Ya Están Creadas

Las tablas del webhook registry ya fueron creadas automáticamente mediante migración. Puedes verificar en Supabase Dashboard → Table Editor:

- ✅ `webhook_subscriptions`
- ✅ `webhook_deliveries`
- ✅ `webhook_events`
- ✅ `processed_webhooks`

### Paso 3: Generar WEBHOOK_SECRET

```bash
# Opción 1: Usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 2: Usando OpenSSL
openssl rand -hex 32
```

**Guarda este secret**, lo necesitarás en varios lugares.

### Paso 4: Crear Suscripciones de Webhooks

Ve a Supabase Dashboard → SQL Editor y ejecuta:

```sql
-- Reemplaza 'TU_SECRET_AQUI' con el secret que generaste
-- Reemplaza 'YOUR_PROJECT' con tu project ID de Supabase

-- Suscripción para architect.registered (Edge Function Logger)
INSERT INTO webhook_subscriptions (
  event_type,
  subscriber_url,
  secret_key,
  retry_config,
  active
) VALUES (
  'architect.registered',
  'https://YOUR_PROJECT.supabase.co/functions/v1/webhook-event-logger',
  'TU_SECRET_AQUI',
  '{"max_attempts": 6, "backoff_intervals": [60, 300, 1800, 7200, 43200]}'::jsonb,
  true
);

-- Suscripción para verification.pending (Edge Function Notifier)
INSERT INTO webhook_subscriptions (
  event_type,
  subscriber_url,
  secret_key,
  retry_config,
  active
) VALUES (
  'verification.pending',
  'https://YOUR_PROJECT.supabase.co/functions/v1/webhook-external-notifier',
  'TU_SECRET_AQUI',
  '{"max_attempts": 6, "backoff_intervals": [60, 300, 1800, 7200, 43200]}'::jsonb,
  true
);
```

**Verificar que se crearon:**
```sql
SELECT * FROM webhook_subscriptions;
```

### Paso 5: Desplegar Edge Functions

Las Edge Functions están disponibles en la carpeta `supabase-edge-functions/`. 

**Opción A: Ya están desplegadas** (si las desplegaste con MCP)
- Solo necesitas configurar los secrets

**Opción B: Desplegar manualmente**

1. **Usando Supabase CLI**:
```bash
cd supabase-edge-functions
supabase functions deploy webhook-event-logger
supabase functions deploy webhook-external-notifier
supabase functions deploy webhook-dlq-replay
```

2. **O desde Supabase Dashboard**:
   - Ve a: Edge Functions → Create new function
   - Copia el código de cada `index.ts` desde `supabase-edge-functions/`

### Paso 6: Configurar Secrets de Edge Functions

#### Edge Function: `webhook-event-logger`

1. Ve a: Supabase Dashboard → Edge Functions → `webhook-event-logger` → Secrets
2. Agrega:
   ```
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   WEBHOOK_SECRET=TU_SECRET_AQUI
   ```

#### Edge Function: `webhook-external-notifier`

1. Ve a: Supabase Dashboard → Edge Functions → `webhook-external-notifier` → Secrets
2. Agrega:
   ```
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   WEBHOOK_SECRET=TU_SECRET_AQUI
   RESEND_API_KEY=re_xxxxxxxxxxxxx  (o SENDGRID_API_KEY=SG.xxxxxxxxxxxxx)
   EMAIL_FROM=onboarding@resend.dev  (⚠️ IMPORTANTE: Usa este para pruebas, NO uses Gmail)
   EMAIL_TO=tu-email@example.com
   ```

**📧 Configuración de Email:**
- **Resend** (recomendado): https://resend.com → Crear cuenta → Obtener API Key
- **SendGrid** (alternativa): https://sendgrid.com → Crear cuenta → Obtener API Key
- **EMAIL_FROM**: Para pruebas usa `onboarding@resend.dev` (NO uses Gmail)
- **EMAIL_TO**: Puede ser tu email personal (Gmail, Outlook, etc.)

**⚠️ IMPORTANTE**: 
- NO uses Gmail (ej: `tuemail@gmail.com`) en `EMAIL_FROM`
- Resend no permite usar dominios no verificados
- Para pruebas, SIEMPRE usa: `onboarding@resend.dev`

---

## ⚙️ Configuración de Variables de Entorno

### Paso 1: Microservicio Arquitecto

Crea el archivo `.env` en `microservicio-arquitecto/`:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=arquitecto_user
DB_PASSWORD=arquitecto_pass
DB_DATABASE=arquitecto_db

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
RABBITMQ_EXCHANGE=arquitecto.exchange

# Redis (para Bull)
REDIS_HOST=localhost
REDIS_PORT=6379

# Supabase (para Webhooks)
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_KEY=tu-service-role-key
SERVICE_NAME=microservicio-arquitecto
```

### Paso 2: Microservicio Verificación

Crea el archivo `.env` en `microservicio-verificacion/`:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5434
DB_USERNAME=verificacion_user
DB_PASSWORD=verificacion_pass
DB_DATABASE=verificacion_db

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
RABBITMQ_EXCHANGE=arquitecto.exchange

# Redis (para Bull y Idempotencia)
REDIS_HOST=localhost
REDIS_PORT=6379

# Supabase (para Webhooks)
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_KEY=tu-service-role-key
SERVICE_NAME=microservicio-verificacion
```

### Paso 3: API Gateway (Opcional)

Si usas el API Gateway, crea el archivo `.env` en `api-gateway/`:

```env
# RabbitMQ Configuration
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
RABBITMQ_QUEUE_ARQUITECTO=arquitecto.queue
RABBITMQ_QUEUE_VERIFICACION=verificacion.queue

# Application Configuration
PORT=3000
NODE_ENV=development
```

---

## 🚀 Iniciar los Servicios

### Terminal 1: API Gateway (Opcional)

```bash
cd api-gateway
npm run start:dev
```

**Nota**: El API Gateway es opcional. Puedes llamar directamente a los microservicios si prefieres.

### Terminal 2: Microservicio Arquitecto

```bash
cd microservicio-arquitecto
npm run start:dev
```

Deberías ver:
```
[Nest] INFO WebhookService WebhookService inicializado
[Nest] INFO [NestFactory] Starting Nest application...
```

### Terminal 3: Microservicio Verificación

```bash
cd microservicio-verificacion
npm run start:dev
```

Deberías ver:
```
[Nest] INFO WebhookService WebhookService inicializado
[Nest] INFO EventListenerService Escuchando eventos 'arquitecto.creado' en cola verificacion-events.queue
```

---

## 🧪 Probar el Sistema

### Prueba 1: Crear un Arquitecto (Happy Path)

Esto debería disparar:
1. Evento RabbitMQ `arquitecto.creado`
2. Webhook `architect.registered` → Edge Function Logger
3. Microservicio B crea verificación pendiente
4. Webhook `verification.pending` → Edge Function Notifier (envía email)

```bash
curl -X POST http://localhost:3000/arquitectos \
  -H "Content-Type: application/json" \
  -d '{
    "cedula": "1234567890",
    "descripcion": "Arquitecto de prueba para webhooks",
    "especialidades": "Diseño residencial y comercial",
    "ubicacion": "Quito, Ecuador",
    "usuario_id": "789e0123-e45b-67c8-d901-234567890123"
  }'
```

**Respuesta esperada:**
```json
{
  "id": "uuid-del-arquitecto",
  "cedula": "1234567890",
  ...
}
```

### Verificar que Funcionó

#### 1. Verificar en Logs del Microservicio A

Deberías ver:
```
[Nest] INFO ArquitectoService Webhook architect.registered publicado para arquitecto {id}
```

#### 2. Verificar en Logs del Microservicio B

Deberías ver:
```
[Nest] INFO VerificacionService Verificación automática creada para arquitecto {id}
[Nest] INFO VerificacionService Webhook verification.pending publicado para verificación {id}
```

#### 3. Verificar en Supabase

**Eventos recibidos:**
```sql
SELECT * FROM webhook_events 
ORDER BY processed_at DESC 
LIMIT 5;
```

**Entregas de webhooks:**
```sql
SELECT 
  event_type,
  status,
  attempt_number,
  http_status_code,
  created_at
FROM webhook_deliveries 
ORDER BY created_at DESC 
LIMIT 10;
```

**Verificaciones creadas:**
```sql
-- En la base de datos del microservicio de verificación
SELECT * FROM verificaciones ORDER BY created_at DESC LIMIT 5;
```

#### 4. Verificar Email

Si configuraste Resend o SendGrid, deberías recibir un email con:
- **Asunto**: `🔔 Webhook: verification.pending`
- **Contenido**: HTML formateado con los datos de la verificación

### Prueba 2: Verificar Resiliencia (DLQ)

Para probar el sistema de retry y DLQ:

1. **Detener temporalmente la Edge Function** (desactivar en Supabase Dashboard)
2. **Crear otro arquitecto**:
```bash
curl -X POST http://localhost:3000/arquitectos \
  -H "Content-Type: application/json" \
  -d '{
    "cedula": "9876543210",
    "descripcion": "Prueba de resiliencia",
    "especialidades": "Diseño urbano",
    "ubicacion": "Guayaquil, Ecuador",
    "usuario_id": "789e0123-e45b-67c8-d901-234567890123"
  }'
```

3. **Verificar intentos de retry**:
```sql
SELECT 
  event_type,
  status,
  attempt_number,
  next_retry_at,
  error_message
FROM webhook_deliveries 
WHERE status IN ('pending', 'failed', 'dlq')
ORDER BY created_at DESC;
```

4. **Después de 6 intentos fallidos**, el webhook debería estar en DLQ:
```sql
SELECT * FROM webhook_deliveries 
WHERE status = 'dlq' 
ORDER BY created_at DESC;
```

5. **Reactivar la Edge Function** y usar el Replay Mechanism:
```bash
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/webhook-dlq-replay?limit=10" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

**Nota**: Asegúrate de configurar el secret `SUPABASE_ANON_KEY` en la Edge Function `webhook-dlq-replay` para que pueda autenticarse al reenviar webhooks.

---

## 📊 Monitoreo y Verificación

### Consultas SQL Útiles

#### Ver todas las entregas recientes
```sql
SELECT 
  id,
  event_type,
  subscriber_url,
  status,
  attempt_number,
  http_status_code,
  created_at,
  delivered_at
FROM webhook_deliveries 
ORDER BY created_at DESC 
LIMIT 20;
```

#### Estadísticas por estado
```sql
SELECT 
  status,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as exitosos,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as fallidos,
  COUNT(CASE WHEN status = 'dlq' THEN 1 END) as dlq
FROM webhook_deliveries 
GROUP BY status;
```

#### Ver eventos recibidos
```sql
SELECT 
  event_id,
  event_type,
  idempotency_key,
  correlation_id,
  processed_at
FROM webhook_events 
ORDER BY processed_at DESC 
LIMIT 10;
```

#### Ver suscripciones activas
```sql
SELECT 
  event_type,
  subscriber_url,
  active,
  retry_config
FROM webhook_subscriptions 
WHERE active = true;
```

### Ver Logs de Edge Functions

1. Ve a: Supabase Dashboard → Edge Functions → `webhook-event-logger` → Logs
2. Los logs muestran información detallada con:
   - Request ID único para rastreo
   - Niveles de log: [INFO], [DEBUG], [WARN], [ERROR]
   - Timestamps y tiempos de procesamiento
   - Detalles de validaciones y operaciones

---

## 🔍 Troubleshooting

### Problema: "No hay suscriptores activos para el evento"

**Solución:**
1. Verifica que las suscripciones estén creadas:
```sql
SELECT * FROM webhook_subscriptions WHERE active = true;
```

2. Verifica que el `event_type` coincida exactamente (case-sensitive)

### Problema: "Invalid HMAC signature"

**Solución:**
1. Verifica que el `WEBHOOK_SECRET` sea el mismo en:
   - Tabla `webhook_subscriptions.secret_key`
   - Edge Function secrets `WEBHOOK_SECRET`
2. Regenera el secret si es necesario

### Problema: Los webhooks no se envían

**Solución:**
1. Verifica que Redis esté corriendo: `docker-compose ps`
2. Verifica los logs del microservicio:
```bash
# Buscar errores en los logs
grep -i "error" logs/*.log
```

3. Verifica que Bull esté procesando jobs:
   - Los logs deberían mostrar: `Procesando entrega de webhook`

### Problema: No recibo emails

**Solución:**
1. Verifica los secrets de la Edge Function `webhook-external-notifier`
2. Verifica los logs de la Edge Function en Supabase Dashboard
3. Revisa la carpeta de spam
4. **IMPORTANTE**: Usa `onboarding@resend.dev` en `EMAIL_FROM` para pruebas
   - NO uses Gmail (ej: `tuemail@gmail.com`) en `EMAIL_FROM`
   - Resend no permite usar dominios no verificados
5. Verifica que `RESEND_API_KEY` o `SENDGRID_API_KEY` esté correcto

### Problema: Error de conexión a Supabase

**Solución:**
1. Verifica que `SUPABASE_URL` y `SUPABASE_SERVICE_KEY` estén correctos
2. Verifica que el proyecto de Supabase esté activo
3. Verifica la conectividad:
```bash
curl https://YOUR_PROJECT.supabase.co/rest/v1/webhook_subscriptions \
  -H "apikey: YOUR_SERVICE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY"
```

### Problema: RabbitMQ no conecta

**Solución:**
1. Verifica que RabbitMQ esté corriendo: `docker-compose ps`
2. Accede a la UI: http://localhost:15672 (admin/admin123)
3. Verifica las credenciales en `.env`

### Problema: Migraciones fallan

**Solución:**
1. Verifica que PostgreSQL esté corriendo: `docker-compose ps`
2. Verifica las credenciales en `.env`
3. Intenta conectarte manualmente:
```bash
psql -h localhost -p 5433 -U arquitecto_user -d arquitecto_db
```

---

## ✅ Checklist de Verificación

Antes de probar, verifica que tengas:

- [ ] Docker Compose corriendo (`docker-compose ps`)
- [ ] Dependencias instaladas (`npm install` en ambos microservicios)
- [ ] Migraciones ejecutadas (`npm run migration:run`)
- [ ] Variables de entorno configuradas (`.env` en ambos microservicios)
- [ ] Suscripciones creadas en Supabase (`webhook_subscriptions`)
- [ ] Secrets configurados en Edge Functions
- [ ] Email configurado (Resend o SendGrid) - opcional
- [ ] Microservicios corriendo (`npm run start:dev`)

---

## 📚 Documentación Adicional

- **[README.md](./README.md)** - Documentación principal del proyecto
- **[README-VIDEO.md](./README-VIDEO.md)** - Enlace al video de la práctica
- **[supabase-edge-functions/](./supabase-edge-functions/)** - Código fuente de las Edge Functions

---

## 🎯 Flujo Completo Esperado

```
1. POST /arquitectos
   ↓
2. Microservicio A crea arquitecto
   ↓
3. Publica evento RabbitMQ 'arquitecto.creado'
   ↓
4. Publica webhook 'architect.registered' → Edge Function Logger
   ↓
5. Microservicio B escucha RabbitMQ
   ↓
6. Crea verificación pendiente automáticamente
   ↓
7. Publica webhook 'verification.pending' → Edge Function Notifier
   ↓
8. Edge Function Notifier envía email
   ↓
9. Todo registrado en webhook_events y webhook_deliveries
```

---

## 🆘 ¿Necesitas Ayuda?

1. Revisa los logs de los microservicios (consola donde ejecutas `npm run start:dev`)
2. Revisa los logs de las Edge Functions en Supabase Dashboard
3. Verifica las tablas en Supabase para ver qué está pasando
4. Consulta el README principal: [README.md](./README.md)
5. Revisa el código de las Edge Functions en: `supabase-edge-functions/`

## 📁 Estructura de Archivos

```
semana12/
├── README.md                      # Documentación principal
├── README_WEBHOOKS.md             # Esta guía (configuración de webhooks)
├── README-VIDEO.md                # Enlace al video
├── api-gateway/                   # API Gateway
├── microservicio-arquitecto/      # Microservicio A
├── microservicio-verificacion/    # Microservicio B
├── supabase-edge-functions/       # Edge Functions (código fuente)
│   ├── webhook-event-logger/
│   ├── webhook-external-notifier/
│   └── webhook-dlq-replay/
└── docker-compose.yml            # Orquestación de servicios
```

¡Éxito con tu implementación! 🚀


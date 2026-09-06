# Auth Microservice - NestJS

Este microservicio se encarga exclusivamente de la gestión de autenticación y usuarios del sistema. Utiliza **JWT** con tokens de corta duración (Access Token) y larga duración (Refresh Token) para mayor seguridad.

## Características
- **Tokens duales**: Access Token (15 min) y Refresh Token (7 días).
- **Blacklist**: Los tokens revocados (logout) se guardan en una lista negra.
- **Rate Limiting**: El login tiene una protección de 5 intentos cada 15 minutos por IP.
- **Base de Datos**: Integración con Supabase (PostgreSQL).
- **Validación Local**: Diseñado para que otros servicios validen el token sin consultar a este servicio constantemente.

## Configuración (.env)
Asegúrate de tener un archivo `.env` en la raíz de la carpeta con las siguientes variables:
```env
DB_HOST=tu_host_supabase
DB_PORT=5432
DB_USER=postgres
DB_PASS=tu_password
DB_NAME=postgres
DB_SSL=true

JWT_ACCESS_SECRET=una_cadena_larga_y_segura
JWT_REFRESH_SECRET=otra_cadena_larga_diferente
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

PORT=3001
```

**Nota importante:** Los nombres de las variables de entorno son `DB_USER` y `DB_PASS` (no `DB_USERNAME` ni `DB_PASSWORD`).

## Guía de Pruebas (Endpoints)

### 1. Registro de Usuario
**Endpoint:** `POST /auth/register`
```json
{
  "nombre": "Juan",
  "apellido": "Perez",
  "email": "juan@example.com",
  "password": "Password123!",
  "rol": "cliente",
  "foto_perfil": "https://example.com/foto.jpg"
}
```
*Roles permitidos: cliente, arquitecto, moderador.*

### 2. Inicio de Sesión
**Endpoint:** `POST /auth/login`
```json
{
  "email": "juan@example.com",
  "password": "Password123!"
}
```
**Respuesta:** Recibirás un `access_token` y un `refresh_token`.

### 3. Obtener Usuario Actual (Protegido)
**Endpoint:** `GET /auth/me`
- **Header:** `Authorization: Bearer <TU_ACCESS_TOKEN>`

### 4. Renovar Access Token (Refresh)
**Endpoint:** `POST /auth/refresh`
```json
{
  "refresh_token": "<TU_REFRESH_TOKEN>"
}
```

### 5. Cerrar Sesión (Logout)
**Endpoint:** `POST /auth/logout`
- **Header:** `Authorization: Bearer <TU_ACCESS_TOKEN>`
*Esto invalidará tanto el access token actual como todos los refresh tokens del usuario.*

### 6. Validación Interna (Para otros servicios)
**Endpoint:** `GET /auth/validate`
- **Header:** `Authorization: Bearer <TOKEN_A_VALIDAR>`

---

## Cómo ejecutar
1. Instalar dependencias: `npm install`
2. Iniciar en desarrollo: `npm run start:dev`
3. La API estará disponible en `http://localhost:3001` (o la GateWay en `http://localhost:3000/auth/...`).

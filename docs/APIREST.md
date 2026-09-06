# [CONN]  API REST - ArquiPro

Servicio REST desarrollado en **Ruby on Rails 8.0.3** que proporciona endpoints para la gestión de usuarios, proyectos arquitectónicos, conversaciones, valoraciones y más.

> **Nota:** Este servicio maneja todas las operaciones CRUD básicas. Para consultas complejas y agregaciones, usa el [GraphQL Gateway](./graphql.md).

## [LIST]  Tabla de Contenidos

- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Modelos y Entidades](#modelos-y-entidades)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Autenticación](#autenticación)
- [Testing](#testing)
- [Deployment](#deployment)

---

## ️ Tecnologías

- **Ruby**: 3.4.6
- **Rails**: 8.0.3
- **Base de datos**: PostgreSQL (Supabase)
- **Servidor web**: Puma
- **Autenticación**: Devise + JWT
- **Serialización**: Active Model Serializers
- **Deployment**: Kamal + Docker

---

## ️ Arquitectura

```
app/
├── controllers/
│   ├── api/v1/              # Controladores REST versionados
│   └── usuarios/            # Controladores de autenticación (Devise)
├── models/                  # Modelos ActiveRecord (15 entidades)
├── serializers/             # Serializadores JSON
└── jobs/                    # Background jobs

config/
├── routes.rb                # Definición de rutas API
├── database.yml             # Configuración de PostgreSQL
└── initializers/cors.rb     # Configuración CORS

db/
├── migrate/                 # Migraciones de base de datos
├── seeds/                   # Datos de prueba
└── schema.rb                # Esquema actual de la BD
```

### Patrón MVC
- **Modelos**: Lógica de negocio y validaciones
- **Controladores**: Manejo de peticiones HTTP y respuestas JSON
- **Serializadores**: Formato de salida JSON estructurado

---

## [BATCH]  Modelos y Entidades

El sistema cuenta con **15 entidades principales**:

| Entidad | Descripción |
|---------|-------------|
| `Usuario` | Usuario base del sistema (con autenticación Devise) |
| `Cliente` | Cliente que solicita proyectos |
| `Arquitecto` | Arquitecto verificado con cédula profesional |
| `Moderador` | Moderador del sistema |
| `Proyecto` | Proyecto arquitectónico |
| `SolicitudProyecto` | Solicitud de proyecto por cliente |
| `Avance` | Avance de un proyecto |
| `Incidencia` | Incidencia reportada en un proyecto |
| `Conversacion` | Conversación entre usuarios |
| `Mensaje` | Mensaje de una conversación |
| `Notificacion` | Notificación del sistema |
| `Valoracion` | Valoración/reseña de un proyecto |
| `Verificacion` | Verificación de arquitecto |
| `Imagen` | Imagen almacenada |
| `ImagenAsociacion` | Asociación polimórfica de imágenes |

### Relaciones principales
- Un `Usuario` puede ser `Cliente`, `Arquitecto` o `Moderador`
- `Proyecto` tiene muchos `Avances`, `Incidencias` y `Valoraciones`
- `Conversacion` tiene muchos `Mensajes`
- `Imagen` se asocia polimórficamente mediante `ImagenAsociacion`

---

## [LIST]  Requisitos Previos

### Opción 1: Instalación Nativa (Desarrollo)
- **Ruby** 3.4.6 → [Descargar RubyInstaller](https://rubyinstaller.org/downloads/)
- **Bundler** → `gem install bundler`
- **PostgreSQL Client** → [Descargar PostgreSQL](https://www.postgresql.org/download/windows/)

### Opción 2: Docker (Producción/Aislado)
- **Docker Desktop** → [Descargar Docker](https://www.docker.com/products/docker-desktop/)

---

## [START]  Instalación

### Instalación Nativa

```cmd
# 1. Clonar el repositorio (si no lo has hecho)
cd c:\Users\leoan\Desktop\arqui-pro\backend\APIREST

# 2. Instalar dependencias
# Importante: Ejecuta esto en PowerShell con permisos de Administrador
bundle install

# 3. Configurar base de datos
rails db:create
rails db:migrate

# 4. (Opcional) Cargar datos de prueba
rails db:seed
```

### Instalación con Docker

```cmd
# 1. Construir la imagen
docker build -t apirest .

# 2. Ejecutar el contenedor
docker run -d -p 3000:3000 --name apirest apirest
```

---

## ️ Configuración

### Base de Datos

La configuración por defecto se conecta a **Supabase** (PostgreSQL en la nube):

```yaml
# config/database.yml
default: &default
  adapter: postgresql
  encoding: unicode
  host: aws-1-us-east-2.pooler.supabase.com
  username: postgres.aovwqqmvotdfhxfiofqo
  password: g867MNHn4vQdvi1d
  database: postgres
  pool: 5
  sslmode: disable
```

### Variables de Entorno (Opcional)

Crea un archivo `.env` en la raíz del proyecto:

```env
RAILS_ENV=development
RAILS_MAX_THREADS=5
DATABASE_URL=postgresql://usuario:password@host:5432/database
RAILS_MASTER_KEY=<tu_master_key>
```

### CORS (Cross-Origin Resource Sharing)

Para habilitar peticiones desde el frontend, descomenta en `Gemfile`:

```ruby
gem "rack-cors"
```

Y configura los orígenes permitidos en `config/initializers/cors.rb`:

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:5173'  # URL del frontend
    resource '*', headers: :any, methods: [:get, :post, :put, :patch, :delete, :options]
  end
end
```

---

## ▶️ Ejecución

### Desarrollo (Puerto 3000)

```cmd
# Paso 1: Iniciar RabbitMQ con Docker
cd c:\Users\usuario\Repositorios GitHub\QuintoSemestre\arqui-pro\backend
docker-compose up -d

# Paso 2: Navegar al directorio de la API
cd APIREST

# Terminal 1: Servidor API REST (HTTP)
rails s

# Terminal 2: Consumidor de RabbitMQ (Worker)
ruby bin/rails rabbitmq:consume
```

El servidor estará disponible en: **http://localhost:3000**, el consumidor estará escuchando eventos en segundo plano, y RabbitMQ Management UI estará disponible en: **http://localhost:15672** (usuario: `guest`, contraseña: `guest`).

### Producción con Docker

```cmd
docker run -d -p 80:80 -e RAILS_ENV=production -e RAILS_MASTER_KEY=<key> --name apirest apirest
```

### Health Check

Verifica que el servidor esté corriendo:

```bash
curl http://localhost:3000/up
```

Respuesta esperada: `200 OK`

---

## [CONN]  Endpoints Disponibles

Todos los endpoints están bajo el namespace `/api/v1/`.

### Autenticación (Devise)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/usuarios/sign_up` | Registro de usuario |
| `POST` | `/api/v1/usuarios/sign_in` | Inicio de sesión |
| `DELETE` | `/api/v1/usuarios/sign_out` | Cerrar sesión |

### Recursos CRUD

Todos los recursos siguen el patrón RESTful estándar:

| Recurso | Endpoint Base | Operaciones |
|---------|---------------|-------------|
| Usuarios | `/api/v1/usuarios` | GET, POST, PUT, DELETE |
| Clientes | `/api/v1/clientes` | GET, POST, PUT, DELETE |
| Arquitectos | `/api/v1/arquitectos` | GET, POST, PUT, DELETE |
| Moderadores | `/api/v1/moderadores` | GET, POST, PUT, DELETE |
| Proyectos | `/api/v1/proyectos` | GET, POST, PUT, DELETE |
| Solicitudes Proyecto | `/api/v1/solicitudes_proyecto` | GET, POST, PUT, DELETE |
| Avances | `/api/v1/avances` | GET, POST, PUT, DELETE |
| Incidencias | `/api/v1/incidencias` | GET, POST, PUT, DELETE |
| Conversaciones | `/api/v1/conversaciones` | GET, POST, PUT, DELETE |
| Mensajes | `/api/v1/mensajes` | GET, POST, PUT, DELETE |
| Notificaciones | `/api/v1/notificaciones` | GET, POST, PUT, DELETE |
| Valoraciones | `/api/v1/valoraciones` | GET, POST, PUT, DELETE |
| Verificaciones | `/api/v1/verificaciones` | GET, POST, PUT, DELETE |
| Imágenes | `/api/v1/imagenes` | GET, POST, PUT, DELETE |
| Imagen Asociaciones | `/api/v1/imagen_asociaciones` | GET, POST, PUT, DELETE |

### Operaciones CRUD Estándar

Para cada recurso (ej: `usuarios`):

```bash
# Listar todos
GET /api/v1/usuarios

# Obtener uno específico
GET /api/v1/usuarios/:id

# Crear nuevo
POST /api/v1/usuarios
Content-Type: application/json
{
  "usuario": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "rol": "cliente"
  }
}

# Actualizar
PUT /api/v1/usuarios/:id
Content-Type: application/json
{
  "usuario": {
    "nombre": "Juan Actualizado"
  }
}

# Eliminar
DELETE /api/v1/usuarios/:id
```

---

##  Autenticación

El sistema usa **Devise** para autenticación de usuarios con tokens JWT.

### Flujo de Autenticación

1. **Registro/Login** → Obtener token JWT
2. **Almacenar token** → `localStorage.setItem('auth_token', token)`
3. **Incluir en requests** → Header `Authorization: Bearer <token>`
4. **Validación automática** → Rails valida el token en cada request protegido

### Registro de Usuario

```bash
curl -X POST http://localhost:3000/api/v1/usuarios/sign_up \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": {
      "email": "test@example.com",
      "password": "password123",
      "password_confirmation": "password123",
      "nombre": "Test",
      "apellido": "User",
      "rol": "cliente"
    }
  }'
```

### Inicio de Sesión

```bash
curl -X POST http://localhost:3000/api/v1/usuarios/sign_in \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": {
      "email": "test@example.com",
      "password": "password123"
    }
  }'
```

Respuesta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "usuario": {
    "id": "uuid",
    "email": "test@example.com",
    "nombre": "Test",
    "rol": "cliente"
  }
}
```

### Uso del Token

En peticiones subsecuentes, incluye el token en el header:

```bash
curl -X GET http://localhost:3000/api/v1/usuarios/:id \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

---

## [TEST]  Testing

### Testing Manual con cURL

#### 1. Health Check
```bash
curl http://localhost:3000/up
```

#### 2. Listar todos los usuarios
```bash
curl http://localhost:3000/api/v1/usuarios
```

#### 3. Crear un cliente
```bash
curl -X POST http://localhost:3000/api/v1/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": {
      "telefono": "5551234567",
      "proyectos_solicitados": 0,
      "usuario_id": "uuid-del-usuario"
    }
  }'
```

#### 4. Crear un proyecto
```bash
curl -X POST http://localhost:3000/api/v1/proyectos \
  -H "Content-Type: application/json" \
  -d '{
    "proyecto": {
      "titulo": "Casa Moderna",
      "descripcion": "Proyecto de casa moderna de 200m2",
      "presupuesto": 500000.0,
      "fecha_inicio": "2025-01-15",
      "fecha_fin_estimada": "2025-06-30",
      "estado_proyecto": "en_progreso",
      "cliente_id": "uuid-del-cliente",
      "arquitecto_id": "uuid-del-arquitecto"
    }
  }'
```

### Testing con Herramientas

#### Thunder Client (VS Code Extension)
1. Instala la extensión "Thunder Client"
2. Crea una colección "ArquiPro API"
3. Añade requests para cada endpoint
4. Guarda variables de entorno (base_url, token)

#### Postman
1. Importa la colección desde `docs/postman_collection.json` (si existe)
2. Configura variables: `{{base_url}}` = `http://localhost:3000`
3. Ejecuta la carpeta de tests

#### Test Suite de Rails
```bash
# Ejecutar todos los tests
rails test

# Ejecutar tests de un modelo específico
rails test test/models/usuario_test.rb

# Ejecutar tests de un controlador
rails test test/controllers/api/v1/usuarios_controller_test.rb
```

---

##  Deployment

### Docker + Kamal

El proyecto incluye configuración para deploy con **Kamal**:

```bash
# 1. Configurar secretos
kamal secrets extract

# 2. Deploy
kamal deploy
```

### Render / Heroku

```bash
# Asegurar que usa PostgreSQL addon
# Configurar variable RAILS_MASTER_KEY

# Deploy automático desde git
git push heroku main
heroku run rails db:migrate
```

### Railway

```bash
# Conectar repo de GitHub
# Railway detectará Rails automáticamente
# Configurar variable DATABASE_URL
```

---

## [PROXY]  Integración con Frontend

### Uso desde React

```typescript
import axiosInstance from './services/api/axiosInstance'

// GET request
const proyectos = await axiosInstance.get('/proyectos')

// POST request
const nuevoProyecto = await axiosInstance.post('/proyectos', {
  proyecto: {
    titulo_proyecto: "Casa Moderna",
    descripcion: "...",
    tipo_proyecto: "contratado"
  }
})
```

### Servicios Disponibles en Frontend

- `proyectosService.ts` - Gestión de proyectos
- `valoracionesService.ts` - Gestión de valoraciones
- `arquitectosService.ts` - Gestión de arquitectos
- `moderador/moderadorService.ts` - Operaciones de moderador

Ver: [Frontend Implementation Guide](../frontend/FRONTEND_IMPLEMENTATION.md)

---

##  Documentación Adicional

- [Guía de Rails API](https://guides.rubyonrails.org/api_app.html)
- [Devise para APIs](https://github.com/heartcombo/devise)
- [Active Model Serializers](https://github.com/rails-api/active_model_serializers)
- [Kamal Deploy](https://kamal-deploy.org/)
- [Frontend REST Implementation](../frontend/FRONTEND_IMPLEMENTATION.md#rest-api-implementation)

---

##  Troubleshooting

### Error: `database does not exist`
```bash
rails db:create
rails db:migrate
```

### Error: `PG::ConnectionBad`
Verifica la configuración en `config/database.yml` y que PostgreSQL esté corriendo.

### Error: `Bundler::GemNotFound`
```bash
bundle install
```

### Limpiar caché
```bash
rails tmp:clear
rails db:reset  # [WARN]  Esto borra toda la BD
```
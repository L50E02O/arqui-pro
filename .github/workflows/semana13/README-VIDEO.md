# Semana 12 - Arquitectura de Microservicios

---------------------------------------------------------
# Enlace del video la practica semana12-Practica Webhooks
https://youtu.be/71P2bLVDR2w
---------------------------------------------------------

## Descripción del Proyecto

Implementación de una arquitectura de microservicios con:
- **Entidad Maestra**: Arquitecto (Microservicio A)
- **Entidad Transaccional**: Verificación (Microservicio B)
- **API Gateway**: Punto de entrada REST
- **RabbitMQ**: Comunicación asíncrona entre microservicios
- **Redis**: Consumidor Idempotente para evitar procesamiento duplicado

## Estructura del Proyecto

```
semana10/
├── api-gateway/          # API Gateway (NestJS)
├── microservicio-arquitecto/  # Microservicio A - Entidad Maestra
├── microservicio-verificacion/ # Microservicio B - Entidad Transaccional
├── docker-compose.yml    # Orquestación de servicios
└── README.md
```

## Componentes

### 1. API Gateway
- Expone endpoints HTTP REST
- Enruta peticiones a los microservicios correspondientes
- No tiene base de datos propia

### 2. Microservicio Arquitecto (Servicio A)
- Base de datos PostgreSQL independiente
- Publica eventos de dominio a través de RabbitMQ
- Escucha eventos de verificación

### 3. Microservicio Verificación (Servicio B)
- Base de datos PostgreSQL independiente
- Se comunica con Microservicio A vía RabbitMQ
- Implementa Consumidor Idempotente con Redis

## Eventos RabbitMQ

### Eventos Publicados por Microservicio A (Arquitecto)
- `arquitecto.creado`
- `arquitecto.actualizado`
- `arquitecto.verificado`

### Eventos Publicados por Microservicio B (Verificación)
- `verificacion.solicitada`
- `verificacion.procesada`
- `verificacion.completada`

## Requisitos

- Node.js 18+
- Docker y Docker Compose
- PostgreSQL (vía Docker)
- RabbitMQ (vía Docker)
- Redis (vía Docker)

## Instalación

1. Instalar dependencias de cada microservicio:
```bash
cd api-gateway && npm install
cd ../microservicio-arquitecto && npm install
cd ../microservicio-verificacion && npm install
```

2. Iniciar servicios con Docker Compose:
```bash
docker-compose up -d
```

3. Ejecutar migraciones:
```bash
cd microservicio-arquitecto && npm run migration:run
cd ../microservicio-verificacion && npm run migration:run
```

4. Iniciar microservicios:
```bash
# Terminal 1
cd api-gateway && npm run start:dev

# Terminal 2
cd microservicio-arquitecto && npm run start:dev

# Terminal 3
cd microservicio-verificacion && npm run start:dev
```

## Endpoints API Gateway

### Arquitectos
- `GET /arquitectos` - Listar arquitectos
- `GET /arquitectos/:id` - Obtener arquitecto por ID
- `POST /arquitectos` - Crear arquitecto
- `PATCH /arquitectos/:id` - Actualizar arquitecto

### Verificaciones
- `GET /verificaciones` - Listar verificaciones
- `GET /verificaciones/:id` - Obtener verificación por ID
- `POST /verificaciones` - Crear solicitud de verificación
- `PATCH /verificaciones/:id` - Actualizar estado de verificación

## Pruebas de Resiliencia

### Prueba de Idempotencia
1. Enviar la misma solicitud de verificación múltiples veces
2. Verificar que solo se procesa una vez en la base de datos

### Prueba de Duplicación de Mensajes
1. Simular fallo de red antes del ACK
2. Verificar que el mensaje duplicado no causa efectos secundarios

## Notas Importantes

- **No existe comunicación HTTP directa** entre Microservicio A y B
- Toda comunicación crítica se realiza vía RabbitMQ
- El Consumidor Idempotente garantiza procesamiento único mediante claves de idempotencia almacenadas en Redis

## Documentación Adicional

- **[INICIO_RAPIDO.md](./docs/INICIO_RAPIDO.md)** - Guía paso a paso para iniciar el proyecto
- **[ESTRUCTURA_PROYECTO.md](./docs/ESTRUCTURA_PROYECTO.md)** - Descripción de la estructura del proyecto
- **[GUIA_PRESENTACION_PRACTICA.md](./docs/GUIA_PRESENTACION_PRACTICA.md)** - Guía completa para la presentación en clase
- **[DEMO_RESILIENCIA.md](./docs/DEMO_RESILIENCIA.md)** - Guía detallada para demostrar resiliencia y manejo de fallos

## Scripts de Verificación

Los scripts de verificación se encuentran en la carpeta `scripts/`:

- `verificar-requisitos.js` - Verifica que el proyecto cumpla con todos los requisitos de arquitectura

## Arquitectura Implementada

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ HTTP REST
       ▼
┌─────────────┐
│ API Gateway │
└──────┬──────┘
       │ RabbitMQ
       ├──────────────┐
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│Microservicio│  │Microservicio│
│ Arquitecto  │  │Verificación│
│  (Puerto    │  │  (Puerto    │
│    3001)    │  │    3002)    │
└──────┬──────┘  └──────┬───────┘
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│ PostgreSQL  │  │ PostgreSQL  │
│ Arquitecto  │  │Verificación│
│  (Puerto    │  │  (Puerto    │
│    5433)    │  │    5434)    │
└─────────────┘  └──────┬───────┘
                       │
                       ▼
                 ┌─────────────┐
                 │    Redis    │
                 │ (Idempotencia)│
                 │  (Puerto    │
                 │    6379)    │
                 └─────────────┘
```

## Características Implementadas

✅ **API Gateway** - Punto único de entrada REST  
✅ **Microservicio Arquitecto** - Entidad Maestra con BD independiente  
✅ **Microservicio Verificación** - Entidad Transaccional con BD independiente  
✅ **RabbitMQ** - Comunicación asíncrona entre microservicios  
✅ **Consumidor Idempotente** - Implementado con Redis  
✅ **Eventos de Dominio** - Publicación y consumo de eventos  
✅ **Docker Compose** - Orquestación de servicios  
✅ **Migraciones TypeORM** - Gestión de esquema de base de datos


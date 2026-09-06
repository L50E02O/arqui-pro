# [CONN]  Integración WebSocket - ArquiPro

## [LIST]  Descripción

Sistema de comunicación en tiempo real que conecta:
- **Rails Backend** → Envía eventos HTTP al servidor WebSocket
- **NestJS WebSocket Server** → Recibe eventos y los emite a clientes conectados
- **Frontend React** → Recibe notificaciones y mensajes en tiempo real

> **Ver:** [Frontend WebSocket Implementation](../frontend/FRONTEND_IMPLEMENTATION.md#websocket-implementation) para detalles de uso en React.

## Arquitectura

```
Rails Backend (Puerto 3000)
    ↓ HTTP POST
WebSocket Server NestJS (Puerto 3006)
    ↓ Socket.IO emit
Clientes Frontend (React)
```

## Configuración

### 1. Variables de Entorno en Rails

Agrega en `.env` o configura en tu entorno:

```bash
WEBSOCKET_SERVER_URL=http://localhost:3006
```

En producción:
```bash
WEBSOCKET_SERVER_URL=https://tu-websocket-server.com
```

### 2. Sin cambios necesarios en NestJS
El servidor WebSocket ya está configurado en el puerto 3006.

## Eventos Implementados

### 1. Proyecto Creado
**Cuándo se dispara**: Cuando un arquitecto crea un nuevo proyecto  
**Endpoint Rails**: `POST /api/v1/proyectos`  
**Evento WebSocket**: `proyecto:creado`  
**Destinatario**: Cliente asociado al proyecto

```json
{
  "evento": "proyecto:creado",
  "data": {
    "proyecto_id": 123,
    "titulo": "Casa Moderna",
    "descripcion": "...",
    "cliente_id": 45,
    "arquitecto_id": 67,
    "timestamp": "2025-11-10T10:30:00Z"
  }
}
```

### 2. Arquitecto Verificado
**Cuándo se dispara**: Cuando un moderador aprueba la verificación de un arquitecto  
**Endpoint Rails**: `POST /api/v1/verificaciones/:id/aprobar`  
**Evento WebSocket**: `arquitecto:verificado`  
**Destinatario**: Arquitecto verificado

```json
{
  "evento": "arquitecto:verificado",
  "data": {
    "arquitecto_id": 67,
    "usuario_id": 89,
    "nombre": "Juan",
    "apellido": "Pérez",
    "verificado": true,
    "timestamp": "2025-11-10T10:35:00Z"
  }
}
```

### 3. Arquitecto Rechazado
**Cuándo se dispara**: Cuando un moderador rechaza la verificación de un arquitecto  
**Endpoint Rails**: `POST /api/v1/verificaciones/:id/rechazar`  
**Evento WebSocket**: `arquitecto:rechazado`  
**Destinatario**: Arquitecto rechazado

```json
{
  "evento": "arquitecto:rechazado",
  "data": {
    "arquitecto_id": 67,
    "usuario_id": 89,
    "nombre": "Juan",
    "apellido": "Pérez",
    "verificado": false,
    "timestamp": "2025-11-10T10:40:00Z"
  }
}
```

## Archivos Modificados/Creados

### Rails (Backend APIREST)

1. **`app/services/websocket_notifier.rb`** (NUEVO)
   - Servicio para enviar eventos HTTP al WebSocket
   - Métodos: `notify_proyecto_creado`, `notify_arquitecto_verificado`, `notify_arquitecto_rechazado`

2. **`app/controllers/api/v1/proyectos_controller.rb`** (MODIFICADO)
   - Agregado: `WebsocketNotifier.notify_proyecto_creado(@proyecto)` en `create`

3. **`app/controllers/api/v1/verificaciones_controller.rb`** (MODIFICADO)
   - Agregado: `WebsocketNotifier.notify_arquitecto_verificado` en `aprobar`
   - Agregado: `WebsocketNotifier.notify_arquitecto_rechazado` en `rechazar`

### NestJS WebSocket Server

4. **`notificacion/notificacion.controller.ts`** (NUEVO)
   - Controlador HTTP para recibir eventos desde Rails
   - Endpoint: `POST /api/notificaciones/emit`

5. **`notificacion/notificacion.module.ts`** (MODIFICADO)
   - Agregado: `NotificacionController` a la lista de controllers

## Cómo Funciona

### Flujo Completo

1. **Arquitecto crea proyecto** en Rails:
   ```ruby
   # ProyectosController#create
   @proyecto.save
   WebsocketNotifier.notify_proyecto_creado(@proyecto)
   ```

2. **Rails envía HTTP POST** al WebSocket:
   ```ruby
   POST http://localhost:3006/api/notificaciones/emit
   Body: {
     "evento": "proyecto:creado",
     "data": { ... }
   }
   ```

3. **NestJS recibe y emite** a clientes conectados:
   ```typescript
   this.notificacionGateway.server.emit('proyecto:creado', data)
   ```

4. **Frontend recibe notificación** en tiempo real:
   ```typescript
   socket.on('proyecto:creado', (data) => {
     // Mostrar notificación al cliente
   })
   ```

## Testing

### 1. Probar desde Rails Console

```ruby
# En rails console
proyecto = Proyecto.last
WebsocketNotifier.notify_proyecto_creado(proyecto)
```

### 2. Probar endpoint directo de NestJS

```bash
curl -X POST http://localhost:3006/api/notificaciones/emit \
  -H "Content-Type: application/json" \
  -d '{
    "evento": "proyecto:creado",
    "data": {
      "proyecto_id": 123,
      "titulo": "Test",
      "cliente_id": 1
    }
  }'
```

### 3. Verificar logs

**Rails:**
```
[SUCCESS]  Notificación enviada al WebSocket: proyecto:creado
```

**NestJS:**
```
[BROADCAST]  Recibido evento desde Rails: proyecto:creado
[SUCCESS]  Evento proyecto:creado emitido a todos los clientes
```

**Frontend:**
```
Notificación recibida: proyecto:creado
```

## Manejo de Errores

El sistema está diseñado para **no interrumpir el flujo principal** si el WebSocket no está disponible:

- Si el WebSocket está caído, Rails solo registra un warning pero continúa
- Timeout de conexión: 2 segundos
- No lanza excepciones que puedan romper la creación de proyectos/verificaciones

## Próximos Pasos

Para tener notificaciones **persistentes** en la base de datos:

1. El WebSocket de NestJS podría llamar de vuelta a Rails para crear el registro en `notificaciones`
2. O Rails crea la notificación en DB **antes** de enviar al WebSocket
3. Los clientes offline recibirán notificaciones al reconectarse consultando `/api/v1/notificaciones`

## [MULTIMODAL]  Integración en Frontend

### Configuración del Cliente

**Archivo:** `frontend/src/services/websocket/notificationService.ts`

```typescript
import { io } from "socket.io-client"

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3006"

const socket = io(`${WS_URL}/notificacion`, {
  transports: ["websocket", "polling"],
  reconnection: true,
  extraHeaders: {
    Authorization: `Bearer ${token}`
  }
})

socket.on("proyecto:creado", (data) => {
  console.log("Nuevo proyecto:", data)
})
```

### Hook Personalizado

```typescript
import { useNotifications } from '../hooks/useNotifications'

const Component = () => {
  const { notificaciones, unreadCount } = useNotifications({
    usuarioId: user?.id,
    autoConnect: true
  })
  
  return <div>Notificaciones: {unreadCount}</div>
}
```

Ver documentación completa: [Frontend WebSocket Implementation](../frontend/FRONTEND_IMPLEMENTATION.md#websocket-implementation)

---

##  Troubleshooting

### El WebSocket no recibe eventos de Rails

1. Verificar que el servidor NestJS esté corriendo:
   ```bash
   curl http://localhost:3006/api/notificaciones/emit
   ```

2. Verificar variable de entorno en Rails:
   ```ruby
   ENV['WEBSOCKET_SERVER_URL']  # Debe ser http://localhost:3006
   ```

3. Revisar logs de Rails:
   ```
   [WARN]  No se pudo conectar al servidor WebSocket
   ```

### Los clientes no reciben eventos

1. Verificar conexión del cliente:
   ```typescript
   socket.connected  // debe ser true
   ```

2. Verificar que el cliente escucha el evento correcto:
   ```typescript
   socket.on('proyecto:creado', ...)  // nombre exacto
   ```

3. Revisar logs de NestJS para confirmar emisión

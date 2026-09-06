# Configuración de WebSocket para Proyectos, Avances, Incidencias y Valoraciones

## [SIGNAL]  Namespaces WebSocket Configurados

### 1. `/proyectos` - Namespace de Proyectos
Maneja eventos relacionados con la creación, actualización y gestión de proyectos.

**Eventos del Cliente (SubscribeMessage):**
- `join_arquitecto` - Unirse a la sala de un arquitecto para recibir sus proyectos
- `join_proyecto` - Unirse a la sala de un proyecto específico
- `join_cliente` - Unirse a la sala de un cliente para recibir proyectos asignados

**Eventos del Servidor (Emit):**
- `proyecto:nuevo` - Nuevo proyecto creado
- `proyecto:actualizado` - Proyecto actualizado
- `proyecto:estado_cambiado` - Estado del proyecto cambió
- `proyecto:asignado` - Proyecto asignado a un cliente

**Endpoints HTTP (Rails → WebSocket):**
- `POST /api/proyectos/emit/nuevo`
- `POST /api/proyectos/emit/actualizado`
- `POST /api/proyectos/emit/estado`
- `POST /api/proyectos/emit/asignado`

---

### 2. `/avances` - Namespace de Avances
Maneja eventos relacionados con avances/progreso de proyectos.

**Eventos del Cliente:**
- `join_proyecto` - Unirse a la sala de un proyecto para recibir sus avances
- `join_arquitecto` - Unirse a la sala de un arquitecto
- `join_cliente` - Unirse a la sala de un cliente

**Eventos del Servidor:**
- `avance:nuevo` - Nuevo avance agregado
- `avance:actualizado` - Avance actualizado
- `avance:eliminado` - Avance eliminado

**Endpoints HTTP:**
- `POST /api/avances/emit/nuevo`
- `POST /api/avances/emit/actualizado`
- `POST /api/avances/emit/eliminado`

---

### 3. `/incidencias` - Namespace de Incidencias
Maneja eventos relacionados con reportes e incidencias.

**Eventos del Cliente:**
- `join_usuario` - Unirse a la sala de un usuario
- `join_moderadores` - Unirse a la sala de moderadores
- `join_incidencia` - Unirse a la sala de una incidencia específica

**Eventos del Servidor:**
- `incidencia:nueva` - Nueva incidencia reportada
- `incidencia:estado_cambiado` - Estado de incidencia cambió
- `incidencia:asignada` - Incidencia asignada a moderador
- `incidencia:resuelta` - Incidencia resuelta

**Endpoints HTTP:**
- `POST /api/incidencias/emit/nueva`
- `POST /api/incidencias/emit/estado`
- `POST /api/incidencias/emit/asignada`
- `POST /api/incidencias/emit/resuelta`

---

### 4. `/valoraciones` - Namespace de Valoraciones
Maneja eventos relacionados con calificaciones y reseñas.

**Eventos del Cliente:**
- `join_proyecto` - Unirse a la sala de un proyecto
- `join_arquitecto` - Unirse a la sala de un arquitecto
- `join_cliente` - Unirse a la sala de un cliente

**Eventos del Servidor:**
- `valoracion:nueva` - Nueva valoración agregada
- `valoracion:actualizada` - Valoración actualizada
- `valoracion:eliminada` - Valoración eliminada
- `valoracion:promedio_actualizado` - Promedio de valoraciones actualizado

**Endpoints HTTP:**
- `POST /api/valoraciones/emit/nueva`
- `POST /api/valoraciones/emit/actualizada`
- `POST /api/valoraciones/emit/eliminada`
- `POST /api/valoraciones/emit/promedio`

---

## [PROXY]  Integración con Rails (Backend)

### Callbacks Automáticos en Modelos

#### Proyecto (`app/models/proyecto.rb`)
```ruby
after_create :notify_proyecto_creado
after_update :notify_proyecto_actualizado
after_update :notify_estado_cambiado, if: :saved_change_to_tipo_proyecto?
after_update :notify_asignado_a_cliente, if: :saved_change_to_cliente_id?
```

#### Avance (`app/models/avance.rb`)
```ruby
after_create :notify_avance_creado
after_update :notify_avance_actualizado
after_destroy :notify_avance_eliminado
```

#### Incidencia (`app/models/incidencia.rb`)
```ruby
after_create :notify_incidencia_creada
after_update :notify_estado_cambiado, if: :saved_change_to_estado?
after_update :notify_asignada_a_moderador, if: :saved_change_to_moderador_id?
after_update :notify_incidencia_resuelta, if: -> { estado == 'resuelto' && saved_change_to_estado? }
```

#### Valoración (`app/models/valoracion.rb`)
```ruby
after_create :notify_valoracion_creada
after_create :notify_promedio_actualizado
after_update :notify_valoracion_actualizada
after_update :notify_promedio_actualizado
after_destroy :notify_valoracion_eliminada
after_destroy :notify_promedio_actualizado_after_destroy
```

---

## [NOTE]  Ejemplos de Uso

### Frontend - Conectar al namespace de Proyectos
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3006/proyectos', {
  transports: ['websocket', 'polling'],
});

// Unirse a la sala de un arquitecto
socket.emit('join_arquitecto', { arquitecto_id: 'uuid-del-arquitecto' });

// Escuchar nuevos proyectos
socket.on('proyecto:nuevo', (proyecto) => {
  console.log('Nuevo proyecto:', proyecto);
});

// Escuchar actualizaciones
socket.on('proyecto:actualizado', (proyecto) => {
  console.log('Proyecto actualizado:', proyecto);
});
```

### Frontend - Conectar al namespace de Avances
```typescript
const socket = io('http://localhost:3006/avances');

// Unirse a la sala de un proyecto
socket.emit('join_proyecto', { proyecto_id: 'uuid-del-proyecto' });

// Escuchar nuevos avances
socket.on('avance:nuevo', (avance) => {
  console.log('Nuevo avance:', avance);
  // Actualizar UI del dashboard
});
```

### Frontend - Conectar al namespace de Incidencias
```typescript
const socket = io('http://localhost:3006/incidencias');

// Para moderadores
socket.emit('join_moderadores');

// Escuchar nuevas incidencias
socket.on('incidencia:nueva', (incidencia) => {
  console.log('Nueva incidencia:', incidencia);
  // Mostrar notificación
});

// Escuchar cambios de estado
socket.on('incidencia:estado_cambiado', (data) => {
  console.log('Estado cambió:', data.estado_anterior, '→', data.estado_nuevo);
});
```

### Frontend - Conectar al namespace de Valoraciones
```typescript
const socket = io('http://localhost:3006/valoraciones');

// Unirse a la sala de un arquitecto
socket.emit('join_arquitecto', { arquitecto_id: 'uuid-del-arquitecto' });

// Escuchar nuevas valoraciones
socket.on('valoracion:nueva', (valoracion) => {
  console.log('Nueva valoración:', valoracion);
});

// Escuchar actualización del promedio
socket.on('valoracion:promedio_actualizado', (data) => {
  console.log('Nuevo promedio:', data.valoracion_promedio);
  // Actualizar estrellas en la UI
});
```

---

## [START]  Flujo de Datos

```
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│   Frontend  │◄──────►│  WebSocket  │◄──────►│    Rails    │
│  (Cliente)  │        │   (NestJS)  │        │   (API)     │
└─────────────┘        └─────────────┘        └─────────────┘
      │                       │                       │
      │ 1. Emit event        │                       │
      │ join_proyecto        │                       │
      │─────────────────────►│                       │
      │                       │                       │
      │                       │   2. Model callback   │
      │                       │◄──────────────────────│
      │                       │   (after_create, etc) │
      │                       │                       │
      │   3. Broadcast event  │                       │
      │◄──────────────────────│                       │
      │   proyecto:nuevo      │                       │
```

---

## [SUCCESS]  Características Implementadas

- [SUCCESS]  **Proyectos**: Creación, actualización, cambio de estado, asignación
- [SUCCESS]  **Avances**: Creación, actualización, eliminación
- [SUCCESS]  **Incidencias**: Creación, cambio de estado, asignación a moderador, resolución
- [SUCCESS]  **Valoraciones**: Creación, actualización, eliminación, cálculo de promedio
- [SUCCESS]  **Salas por rol**: Arquitectos, clientes, moderadores
- [SUCCESS]  **Salas por entidad**: Proyectos específicos, incidencias específicas
- [SUCCESS]  **Callbacks automáticos**: Los eventos se emiten automáticamente desde Rails
- [SUCCESS]  **Serialización de datos**: Envío de datos completos al frontend
- [SUCCESS]  **Logging detallado**: Trazabilidad de eventos

---

## [TOOL]  Configuración Requerida

### Variables de Entorno (Rails)
```bash
WEBSOCKET_SERVER_URL=http://localhost:3006
```

### Servidor WebSocket
El servidor NestJS debe estar corriendo en el puerto 3006:
```bash
cd backend/websocket
npm run start:dev
```

### API REST
El servidor Rails debe estar corriendo:
```bash
cd backend/APIREST
rails server
```

---

## [METRICS]  Dashboard en Tiempo Real

Con esta configuración, el dashboard del frontend puede mostrar:

- **Proyectos nuevos** en tiempo real
- **Cambios de estado** de proyectos
- **Avances** agregados a proyectos
- **Incidencias** reportadas y su resolución
- **Valoraciones** nuevas y promedio actualizado
- **Notificaciones** instantáneas para arquitectos, clientes y moderadores

¡Todo está listo para una experiencia en tiempo real completa! 

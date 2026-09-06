# WebSocket Real-Time Dashboard Implementation

## [LIST]  Resumen

Implementación completa de WebSocket para actualizaciones en tiempo real en dashboards de Arquitectos, Clientes y Moderadores.

##  Recursos Implementados

### Backend (NestJS)

#### 1. **Proyectos** (`/proyectos`)
- **Gateway**: `ProyectoGateway`
- **Controller**: `ProyectoController` (HTTP endpoints para Rails)
- **Service**: `ProyectoService` (CRUD con Rails API)
- **Eventos**:
  - `proyecto:nuevo` - Nuevo proyecto creado
  - `proyecto:actualizado` - Proyecto modificado
  - `proyecto:estado_cambiado` - Cambio de estado/tipo
  - `proyecto:asignado` - Proyecto asignado a cliente
- **Salas**:
  - `arquitecto:{id}` - Proyectos del arquitecto
  - `cliente:{id}` - Proyectos del cliente
  - `proyecto:{id}` - Proyecto específico

#### 2. **Avances** (`/avances`)
- **Gateway**: `AvancesGateway`
- **Controller**: `AvancesController`
- **Service**: `AvancesService`
- **Eventos**:
  - `avance:nuevo` - Nuevo avance registrado
  - `avance:actualizado` - Avance modificado
  - `avance:eliminado` - Avance eliminado
- **Salas**:
  - `proyecto:{id}` - Avances del proyecto
  - `arquitecto:{id}` - Avances del arquitecto
  - `cliente:{id}` - Avances visibles para cliente

#### 3. **Incidencias** (`/incidencias`)
- **Gateway**: `IncidenciasGateway`
- **Controller**: `IncidenciasController`
- **Service**: `IncidenciasService`
- **Eventos**:
  - `incidencia:nueva` - Nueva incidencia reportada
  - `incidencia:estado_cambiado` - Cambio de estado
  - `incidencia:asignada` - Asignada a moderador
  - `incidencia:resuelta` - Incidencia resuelta
- **Salas**:
  - `usuario:{id}` - Incidencias del usuario
  - `moderadores` - Todas las incidencias (moderadores)
  - `incidencia:{id}` - Incidencia específica

#### 4. **Valoraciones** (`/valoraciones`)
- **Gateway**: `ValoracionesGateway`
- **Controller**: `ValoracionesController`
- **Service**: `ValoracionesService`
- **Eventos**:
  - `valoracion:nueva` - Nueva valoración creada
  - `valoracion:actualizada` - Valoración modificada
  - `valoracion:eliminada` - Valoración eliminada
  - `valoracion:promedio_actualizado` - Promedio recalculado
- **Salas**:
  - `arquitecto:{id}` - Valoraciones del arquitecto
  - `proyecto:{id}` - Valoraciones del proyecto

### Backend (Rails)

#### WebsocketNotifier Service
Métodos agregados para notificar al servidor WebSocket:

```ruby
# Proyectos
notify_nuevo_proyecto(proyecto)
notify_proyecto_actualizado(proyecto)
notify_estado_cambiado(proyecto)
notify_asignado_a_cliente(proyecto)

# Avances
notify_nuevo_avance(avance)
notify_avance_actualizado(avance)
notify_avance_eliminado(proyecto_id, avance_id)

# Incidencias
notify_nueva_incidencia(incidencia)
notify_incidencia_estado_cambiado(incidencia)
notify_incidencia_asignada(incidencia)
notify_incidencia_resuelta(incidencia)

# Valoraciones
notify_nueva_valoracion(valoracion)
notify_promedio_actualizado(arquitecto_id, promedio)
```

#### Callbacks en Modelos
- **Proyecto**: `after_create`, `after_update` (estado, cliente)
- **Avance**: `after_create`, `after_update`, `after_destroy`
- **Incidencia**: `after_create`, `after_update` (estado, moderador, resolución)
- **Valoracion**: `after_create`, `after_update`, `after_destroy` (con recálculo de promedio)

### Frontend (React Hooks)

#### 1. `useProyectos`
```typescript
const { proyectos, isConnected, joinArquitecto, joinCliente, joinProyecto } = useProyectos({
  arquitectoId: 'uuid',
  clienteId: 'uuid',
  proyectoId: 'uuid',
  autoConnect: true
});
```

#### 2. `useAvances`
```typescript
const { avances, isConnected, joinProyecto, joinArquitecto, joinCliente } = useAvances({
  proyectoId: 'uuid',
  arquitectoId: 'uuid',
  clienteId: 'uuid',
  autoConnect: true
});
```

#### 3. `useIncidencias`
```typescript
const { incidencias, isConnected, joinUsuario, joinIncidencia, joinModeradores } = useIncidencias({
  usuarioId: 'uuid',
  incidenciaId: 'uuid',
  esModerador: false,
  autoConnect: true
});
```

#### 4. `useValoraciones`
```typescript
const { valoraciones, promedio, totalValoraciones, isConnected, joinArquitecto, joinProyecto } = useValoraciones({
  arquitectoId: 'uuid',
  proyectoId: 'uuid',
  autoConnect: true
});
```

### Dashboards Actualizados

#### 1. **ArchitectDashboard**
- [SUCCESS]  Conexión a `/proyectos` con `arquitectoId`
- [SUCCESS]  Conexión a `/avances` con `arquitectoId`
- [SUCCESS]  Conexión a `/valoraciones` con `arquitectoId`
- [SUCCESS]  Actualización automática de estadísticas
- [SUCCESS]  Indicadores visuales de conexión WebSocket
- [SUCCESS]  Lista de proyectos se actualiza en tiempo real

#### 2. **ClienteHomePage**
- [SUCCESS]  Conexión a `/proyectos` con `clienteId`
- [SUCCESS]  Conexión a `/valoraciones` (observar arquitectos)
- [SUCCESS]  Proyectos recientes se actualizan automáticamente
- [SUCCESS]  Indicadores de conexión WebSocket

#### 3. **ModeratorDashboard**
- [SUCCESS]  Conexión a `/incidencias` como moderador
- [SUCCESS]  Conexión a `/proyectos` (monitoreo general)
- [SUCCESS]  Estadísticas de incidencias en tiempo real
- [SUCCESS]  Estadísticas de proyectos en tiempo real
- [SUCCESS]  Indicadores visuales en tarjetas de estadísticas

## [MULTIMODAL]  Estilos Agregados

### Indicadores WebSocket
```css
/* Punto verde pulsante */
.ws-status.ws-connected {
  background-color: #10b981;
  animation: pulse-ws 2s infinite;
}

/* Banner de estado */
.ws-indicator {
  background: linear-gradient(135deg, #dcfce7, #d1fae5);
  color: #047857;
}

/* Indicador inline para moderador */
.ws-status-inline {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  animation: pulse-ws-inline 2s infinite;
}
```

## [TOOL]  Configuración

### Variables de Entorno
```bash
# Backend WebSocket
APIREST_URL=http://localhost:3000

# Frontend
VITE_WEBSOCKET_URL=http://localhost:3006
```

### Puertos
- **WebSocket Server**: 3006
- **Rails API**: 3000
- **Frontend**: 5173 (Vite dev)

## [SIGNAL]  Flujo de Datos

```
1. Usuario realiza acción en Frontend
   ↓
2. Frontend llama a Rails API REST
   ↓
3. Rails guarda en DB y ejecuta callback (after_create, after_update, etc.)
   ↓
4. Callback llama a WebsocketNotifier
   ↓
5. WebsocketNotifier hace POST a WebSocket server
   ↓
6. WebSocket Gateway emite evento a salas correspondientes
   ↓
7. Frontend hook recibe evento y actualiza estado
   ↓
8. Dashboard se actualiza automáticamente
```

## [SUCCESS]  Características

- **Auto-reconexión**: Los hooks intentan reconectar automáticamente
- **Prevención de duplicados**: Validación de IDs antes de agregar elementos
- **Salas dinámicas**: Join/leave automático según contexto del usuario
- **TypeScript completo**: Tipos definidos para todos los eventos y datos
- **Indicadores visuales**: Puntos verdes animados muestran estado de conexión
- **Limpieza automática**: Desconexión al desmontar componentes

## [START]  Uso en Nuevos Componentes

```typescript
import { useProyectos } from '../../hooks/useProyectos';

function MiComponente() {
  const { user } = useAuth();
  
  const { proyectos, isConnected } = useProyectos({
    arquitectoId: user?.arquitecto_id,
    autoConnect: true
  });

  return (
    <div>
      {isConnected && <span className="ws-status ws-connected">●</span>}
      {proyectos.map(p => <ProyectoCard key={p.id} proyecto={p} />)}
    </div>
  );
}
```

## [TEST]  Testing

### Probar WebSocket manualmente:
```javascript
// En consola del navegador
import io from 'socket.io-client';

const socket = io('http://localhost:3006/proyectos');
socket.on('connect', () => console.log('Connected!'));
socket.emit('join_arquitecto', { arquitecto_id: 'uuid-aqui' });
socket.on('proyecto:nuevo', (data) => console.log('Nuevo proyecto:', data));
```

### Probar desde Rails console:
```ruby
# Simular creación de proyecto
proyecto = Proyecto.create!(
  titulo_proyecto: "Test WebSocket",
  descripcion: "Testing real-time",
  tipo_proyecto: "portafolio",
  arquitecto_id: "uuid-arquitecto"
)
# El callback automáticamente notificará al WebSocket
```

## [NOTE]  Notas Importantes

1. **Orden de ejecución**: Los callbacks se ejecutan DESPUÉS de guardar en DB
2. **Errores en callbacks**: Si WebSocket falla, no afecta la operación principal
3. **IDs temporales**: Frontend filtra IDs locales (msg-, conv-) antes de enviar a backend
4. **Promedio de valoraciones**: Se recalcula en cada create/update/destroy de Valoracion
5. **Moderadores**: Usan sala especial `moderadores` para ver todas las incidencias

##  Seguridad

- Validación de autorización en servicios NestJS
- Headers de autorización propagados desde Rails
- Salas privadas por usuario/rol
- No se exponen datos sensibles en eventos WebSocket

##  Documentación Relacionada

- [WEBSOCKET_INTEGRATION.md](./WEBSOCKET_INTEGRATION.md) - Configuración de chat
- [APIREST.md](./APIREST.md) - Endpoints Rails
- [graphql.md](./graphql.md) - Queries GraphQL

---

**Última actualización**: Noviembre 12, 2025
**Versión**: 1.0.0

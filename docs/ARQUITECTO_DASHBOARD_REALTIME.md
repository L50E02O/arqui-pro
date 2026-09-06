# Dashboard en Tiempo Real para Arquitectos

## Resumen

Se ha implementado un sistema completo de actualización en tiempo real para el dashboard del arquitecto, incluyendo notificaciones de incidencias, proyectos, avances y valoraciones.

## Componentes Implementados

### 1. Backend - Gateway de Incidencias Mejorado

**Archivo:** `backend/websocket/incidencias/incidencias.gateway.ts`

#### Nuevas Funcionalidades:

- **Sala de Arquitecto**: Los arquitectos ahora pueden unirse a una sala específica para recibir todas las incidencias relacionadas con sus proyectos.
  
  ```typescript
  @SubscribeMessage('join_arquitecto')
  handleJoinArquitecto({ arquitecto_id })
  ```

- **Sala de Proyecto**: Posibilidad de suscribirse a incidencias de un proyecto específico.
  
  ```typescript
  @SubscribeMessage('join_proyecto')
  handleJoinProyecto({ proyecto_id })
  ```

#### Eventos Emitidos:

Todos los métodos `emit` ahora incluyen parámetros opcionales para `arquitecto_id` y `proyecto_id`:

- `emitNuevaIncidencia()` - Notifica cuando se crea una nueva incidencia
- `emitIncidenciaEstadoCambiado()` - Notifica cambios de estado
- `emitIncidenciaResuelta()` - Notifica cuando se resuelve una incidencia

### 2. Frontend - Hook Consolidado

**Archivo:** `frontend/src/hooks/useArchitectDashboard.ts`

Este hook unifica todos los websockets necesarios para el dashboard del arquitecto:

```typescript
const dashboard = useArchitectDashboard({
  arquitectoId: 'arq-123',
  autoConnect: true
});
```

#### Características:

- **Conexión Múltiple**: Se conecta simultáneamente a 4 namespaces:
  - `/proyectos` - Actualizaciones de proyectos
  - `/avances` - Nuevos avances en proyectos
  - `/valoraciones` - Calificaciones y valoraciones
  - `/incidencias` - Incidencias reportadas

- **Estadísticas en Tiempo Real**: Calcula automáticamente:
  - Total de proyectos
  - Proyectos en progreso
  - Proyectos completados
  - Total de avances
  - Promedio de valoraciones
  - Incidencias pendientes
  - Incidencias resueltas
  - Total de incidencias

- **Estados de Conexión**: Monitorea el estado de cada websocket individualmente.

#### Uso:

```typescript
const {
  proyectos,           // Array de proyectos actualizados
  avances,             // Array de avances actualizados
  valoraciones,        // Array de valoraciones actualizadas
  incidencias,         // Array de incidencias actualizadas
  stats,               // Estadísticas calculadas
  isConnected,         // Al menos un WS conectado
  allConnected,        // Todos los WS conectados
  connections,         // Estado individual de cada conexión
  initializeData,      // Función para inicializar datos
} = dashboard;
```

### 3. Dashboard del Arquitecto Actualizado

**Archivo:** `frontend/src/pages/Arquitecto/ArchitectDashboard.tsx`

#### Mejoras Implementadas:

1. **Reemplazo de Hooks Individuales**: Se eliminaron `useProyectos`, `useAvances`, y `useValoraciones` individuales y se reemplazaron por el hook unificado `useArchitectDashboard`.

2. **Estadísticas Ampliadas**: Se agregaron dos nuevas tarjetas de estadísticas:
   - **Incidencias Pendientes**: Muestra el conteo de incidencias activas con un badge de alerta si hay incidencias pendientes
   - **Total de Incidencias**: Muestra el histórico completo de incidencias

3. **Indicadores de Conexión**: Cada estadística muestra un indicador visual (●) cuando su websocket está conectado.

4. **Carga Inicial de Datos**: Al cargar el componente, se obtienen los datos desde la API y luego se mantienen actualizados vía websockets.

### 4. Estilos CSS

**Archivo:** `frontend/src/styles/ArchitectDashboard.css`

#### Nuevos Estilos:

- `.estadistica-icono.incidencias` - Icono con gradiente rojo para incidencias activas
- `.estadistica-icono.incidencias-total` - Icono con gradiente gris para total de incidencias
- `.badge-alert` - Badge animado para alertas de incidencias pendientes
- `.ws-indicator.ws-partial` - Indicador amarillo cuando algunos servicios están conectando

### 5. Tipos Actualizados

**Archivo:** `frontend/src/types/incidencia.types.ts`

Se actualizó la interfaz `Incidencia` para soportar todos los campos necesarios:

```typescript
export interface Incidencia {
  id: string
  titulo?: string
  descripcion: string
  estado: 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado' | 'en revision'
  prioridad?: 'baja' | 'media' | 'alta' | 'urgente'
  tipo?: string
  usuario_id?: string
  moderador_id?: string
  proyecto_id?: string
  imagenes?: string[] | Imagen[]
  created_at?: string
  updated_at?: string
  // ... más campos
}
```

## Flujo de Datos en Tiempo Real

### 1. Conexión Inicial

```
Usuario carga dashboard
  ↓
Se obtiene ID del arquitecto
  ↓
useArchitectDashboard se conecta a 4 namespaces
  ↓
Cliente se une a sala: `arquitecto:{arquitecto_id}`
```

### 2. Evento de Nueva Incidencia

```
Backend detecta nueva incidencia en proyecto del arquitecto
  ↓
incidenciasGateway.emitNuevaIncidencia()
  ↓
Emite a salas:
  - usuario:{usuario_id}
  - moderadores
  - arquitecto:{arquitecto_id}  ← NUEVO
  - proyecto:{proyecto_id}       ← NUEVO
  ↓
useIncidencias recibe 'incidencia:nueva'
  ↓
useArchitectDashboard actualiza estado
  ↓
Stats se recalculan automáticamente
  ↓
Dashboard se re-renderiza con nuevos datos
```

### 3. Cálculo Automático de Estadísticas

El hook `useArchitectDashboard` recalcula las estadísticas cada vez que cambian los datos:

```typescript
useEffect(() => {
  calcularEstadisticas();
}, [proyectos, avances, valoraciones, incidencias]);
```

## Ventajas de esta Implementación

1. **Código Limpio**: Un solo hook en lugar de 4 hooks separados
2. **Sincronización Automática**: Las estadísticas se actualizan automáticamente cuando llegan nuevos datos
3. **Rendimiento**: Reduce re-renders innecesarios consolidando actualizaciones
4. **Mantenibilidad**: Más fácil de mantener y extender
5. **Experiencia de Usuario**: Feedback inmediato de todas las actividades
6. **Visibilidad**: Los arquitectos ven incidencias de sus proyectos en tiempo real

## Uso en el Backend (Para llamar desde controladores)

Cuando se crea o actualiza una incidencia en el backend, asegúrate de incluir el `arquitecto_id` y `proyecto_id`:

```typescript
// En tu servicio de incidencias
await incidenciasGateway.emitNuevaIncidencia(
  usuario_emisor_id,
  usuario_infractor_id,
  incidencia,
  arquitecto_id,    // ID del arquitecto del proyecto
  proyecto_id       // ID del proyecto relacionado
);
```

## Testing

Para probar la funcionalidad en tiempo real:

1. Abre el dashboard del arquitecto
2. Verifica que todos los indicadores de conexión WebSocket estén verdes
3. Desde otra ventana/usuario, crea una nueva incidencia en un proyecto del arquitecto
4. Observa que el contador de "Incidencias Pendientes" se actualiza inmediatamente
5. El badge de alerta (!) debe aparecer si hay incidencias pendientes

## Próximas Mejoras Recomendadas

1. **Notificaciones Toast**: Mostrar toast cuando llega una nueva incidencia
2. **Panel de Incidencias**: Sección dedicada para ver y gestionar incidencias
3. **Filtros**: Permitir filtrar incidencias por estado/prioridad
4. **Sonido de Alerta**: Opcional para incidencias de alta prioridad
5. **Dashboard de Moderador**: Similar implementación para moderadores

## Conclusión

El dashboard del arquitecto ahora está completamente integrado con el sistema de tiempo real, proporcionando actualizaciones instantáneas de proyectos, avances, valoraciones e incidencias. La arquitectura modular permite fácil extensión para futuras funcionalidades.

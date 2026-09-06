#  Hooks con Caché - Guía de Uso

## Hooks Disponibles

Todos estos hooks están en `frontend/src/hooks/useApiWithCache.ts` y usan caché automático con localStorage.

### [LIST]  Lista de Hooks

| Hook | Descripción | Duración Caché |
|------|-------------|----------------|
| `useProyectos` | Lista de proyectos con filtros | 5 min |
| `useProyecto` | Proyecto individual por ID | 5 min |
| `useValoraciones` | Valoraciones de un proyecto | 3 min |
| `useNotificaciones` | Notificaciones del usuario | 1 min |
| `useConversaciones` | Conversaciones del usuario | 2 min |
| `useMensajes` | Mensajes de una conversación | 1 min |
| `useUsuarioPerfil` | Perfil de usuario | 10 min |
| `useEstadisticas` | Estadísticas del arquitecto | 5 min |

---

##  Ejemplos de Uso

### 1. Lista de Proyectos

```typescript
import { useProyectos } from '@/hooks/useApiWithCache'

function ProyectosPage() {
  const { data, loading, error, refetch, clearCache } = useProyectos({
    estado: 'completado',
    arquitecto_id: '123'
  })

  if (loading) return <div>Cargando proyectos...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <button onClick={refetch}>[PROXY]  Refrescar</button>
      <button onClick={clearCache}>️ Limpiar Caché</button>
      
      {data?.proyectos.map(proyecto => (
        <ProyectoCard key={proyecto.id} {...proyecto} />
      ))}
    </div>
  )
}
```

### 2. Proyecto Individual

```typescript
import { useProyecto } from '@/hooks/useApiWithCache'
import { useParams } from 'react-router-dom'

function ProyectoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: proyecto, loading, error } = useProyecto(id)

  if (loading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  if (!proyecto) return <NotFound />

  return (
    <div>
      <h1>{proyecto.titulo}</h1>
      <p>{proyecto.descripcion}</p>
      <img src={proyecto.imagen_url} alt={proyecto.titulo} />
    </div>
  )
}
```

### 3. Notificaciones en Tiempo Real

```typescript
import { useNotificaciones } from '@/hooks/useApiWithCache'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'

function NotificationBell() {
  const { user } = useAuth()
  const { 
    data: notificaciones, 
    loading, 
    refetch 
  } = useNotificaciones(user?.id)

  // Refrescar cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [refetch])

  const noLeidas = notificaciones?.filter(n => !n.leida).length || 0

  return (
    <div className="notification-bell">
      <Bell />
      {noLeidas > 0 && <Badge>{noLeidas}</Badge>}
    </div>
  )
}
```

### 4. Chat con Mensajes en Caché

```typescript
import { useMensajes, useConversaciones } from '@/hooks/useApiWithCache'
import { useState } from 'react'

function ChatPage() {
  const [conversacionActiva, setConversacionActiva] = useState<string>()
  
  const { data: conversaciones } = useConversaciones(user?.id)
  const { 
    data: mensajes, 
    loading: loadingMensajes,
    refetch: refetchMensajes 
  } = useMensajes(conversacionActiva)

  const handleSelectConversacion = (id: string) => {
    setConversacionActiva(id)
  }

  return (
    <div className="chat-layout">
      <ConversacionList 
        conversaciones={conversaciones}
        onSelect={handleSelectConversacion}
      />
      
      <MensajesPanel 
        mensajes={mensajes}
        loading={loadingMensajes}
        onNewMessage={() => refetchMensajes()} // Refrescar al enviar
      />
    </div>
  )
}
```

### 5. Perfil de Usuario

```typescript
import { useUsuarioPerfil } from '@/hooks/useApiWithCache'

function UserProfile({ userId }: { userId: string }) {
  const { 
    data: perfil, 
    loading, 
    error, 
    clearCache 
  } = useUsuarioPerfil(userId)

  const handleUpdateProfile = async (newData: any) => {
    // Actualizar perfil en el servidor
    await api.put(`/usuarios/${userId}`, newData)
    
    // Limpiar caché para forzar recarga
    clearCache()
  }

  if (loading) return <ProfileSkeleton />
  if (error) return <ErrorBanner error={error} />

  return (
    <div className="profile">
      <Avatar src={perfil?.foto_perfil} />
      <h2>{perfil?.nombre} {perfil?.apellido}</h2>
      <p>{perfil?.email}</p>
      <EditButton onClick={() => handleUpdateProfile({...})} />
    </div>
  )
}
```

### 6. Dashboard con Estadísticas

```typescript
import { useEstadisticas } from '@/hooks/useApiWithCache'
import { useAuth } from '@/contexts/AuthContext'

function DashboardPage() {
  const { arquitectoId } = useAuth()
  const { data: stats, loading } = useEstadisticas(arquitectoId)

  if (loading) return <DashboardSkeleton />

  return (
    <div className="dashboard">
      <StatCard 
        title="Proyectos Activos" 
        value={stats?.proyectos_activos} 
      />
      <StatCard 
        title="Valoración Promedio" 
        value={stats?.valoracion_promedio} 
      />
      <StatCard 
        title="Total Proyectos" 
        value={stats?.total_proyectos} 
      />
      
      <Chart data={stats?.proyectos_por_mes} />
    </div>
  )
}
```

### 7. Valoraciones de Proyecto

```typescript
import { useValoraciones } from '@/hooks/useApiWithCache'

function ProyectoReviews({ proyectoId }: { proyectoId: string }) {
  const { 
    data: valoraciones, 
    loading, 
    refetch 
  } = useValoraciones(proyectoId)

  const handleNewReview = async (review: any) => {
    await api.post(`/proyectos/${proyectoId}/valoraciones`, review)
    refetch() // Actualizar lista después de crear
  }

  if (loading) return <Spinner />

  const promedio = valoraciones?.reduce((sum, v) => sum + v.puntuacion, 0) 
    / (valoraciones?.length || 1)

  return (
    <div className="reviews">
      <h3>Valoraciones ({valoraciones?.length})</h3>
      <RatingStars value={promedio} />
      
      {valoraciones?.map(val => (
        <ReviewCard key={val.id} {...val} />
      ))}
      
      <AddReviewButton onClick={handleNewReview} />
    </div>
  )
}
```

---

## [PROXY]  Manejo de Refetch

### Refetch Automático (Polling)

```typescript
function RealTimeData() {
  const { data, refetch } = useNotificaciones(userId)

  useEffect(() => {
    // Refrescar cada 30 segundos
    const interval = setInterval(refetch, 30000)
    return () => clearInterval(interval)
  }, [refetch])

  return <div>{data?.length} notificaciones</div>
}
```

### Refetch Manual

```typescript
function ManualRefresh() {
  const { data, loading, refetch } = useProyectos()

  return (
    <div>
      <button 
        onClick={refetch} 
        disabled={loading}
      >
        {loading ? 'Refrescando...' : '[PROXY]  Refrescar'}
      </button>
      {/* ... */}
    </div>
  )
}
```

### Refetch después de Mutación

```typescript
function CreateProject() {
  const { refetch } = useProyectos()

  const handleCreate = async (projectData: any) => {
    await api.post('/proyectos', projectData)
    await refetch() // Actualizar lista
  }

  return <ProjectForm onSubmit={handleCreate} />
}
```

---

## ️ Limpieza de Caché

### Limpiar Caché Individual

```typescript
const { clearCache } = useProyecto(id)

// Al actualizar datos
const handleUpdate = async () => {
  await api.put(`/proyectos/${id}`, newData)
  clearCache() // Forzar recarga en próxima visita
}
```

### Limpiar Todo el Caché

```typescript
import { CacheService } from '@/utils/cacheService'

function Settings() {
  const handleClearAllCache = () => {
    CacheService.clearAll()
    window.location.reload()
  }

  return (
    <button onClick={handleClearAllCache}>
      Limpiar Todo el Caché
    </button>
  )
}
```

---

## [MULTIMODAL]  Patrones de UI

### Loading States

```typescript
function DataComponent() {
  const { data, loading, error } = useProyectos()

  if (loading) return <Skeleton />
  if (error) return <ErrorState error={error} />
  if (!data || data.length === 0) return <EmptyState />

  return <DataList data={data} />
}
```

### Error Boundaries

```typescript
function SafeComponent() {
  const { data, error, refetch } = useProyectos()

  if (error) {
    return (
      <ErrorBoundary>
        <p>Error: {error.message}</p>
        <button onClick={refetch}>Reintentar</button>
      </ErrorBoundary>
    )
  }

  return <DataView data={data} />
}
```

---

##  Performance Tips

1. **Duración adecuada**: Datos estáticos → más tiempo, dinámicos → menos tiempo
2. **Refetch inteligente**: Solo cuando sea necesario
3. **clearCache estratégico**: Limpiar después de mutaciones (POST/PUT/DELETE)
4. **Dependencies correctas**: Incluir todas las variables que afectan la query

---

##  Debugging

### Ver qué está en caché

```typescript
import { CacheService } from '@/utils/cacheService'

console.log('Tamaño del localStorage:', CacheService.getStorageSize(), 'bytes')

// Ver un caché específico
const cached = CacheService.get('proyectos_cache')
console.log('Proyectos en caché:', cached)
```

### Console Logs Automáticos

Los hooks ya incluyen logs útiles:
- `[BATCH]  Usando datos desde caché [key]`
- `[NET]  Obteniendo datos desde API [key]`
- `[PROXY]  Refrescando datos [key]`
- `️ Limpiando caché [key]`

---

**¿Preguntas?** Revisa `frontend/src/services/CACHE_SYSTEM.md` para más detalles.

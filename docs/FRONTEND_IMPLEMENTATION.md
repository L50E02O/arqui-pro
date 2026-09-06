# [MULTIMODAL]  Implementación Frontend - REST, GraphQL y WebSocket

Este documento explica cómo se implementaron las tres tecnologías de comunicación (REST, GraphQL y WebSocket) en el frontend de ArquiPro.

## [LIST]  Tabla de Contenidos

- [Arquitectura de Comunicación](#arquitectura-de-comunicación)
- [REST API Implementation](#rest-api-implementation)
- [GraphQL Implementation](#graphql-implementation)
- [WebSocket Implementation](#websocket-implementation)
- [Cuándo Usar Cada Tecnología](#cuándo-usar-cada-tecnología)
- [Ejemplos Prácticos](#ejemplos-prácticos)
- [Configuración](#configuración)

---

## ️ Arquitectura de Comunicación

El frontend de ArquiPro utiliza **tres tecnologías complementarias** para comunicarse con el backend:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   REST API   │  │   GraphQL    │  │  WebSocket   │  │
│  │   (Axios)    │  │ (Apollo)     │  │ (Socket.io)  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
└─────────┼─────────────────┼──────────────────┼──────────┘
          │                 │                  │
          ▼                 ▼                  ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │  Rails   │    │ GraphQL  │    │ NestJS   │
    │  :3000   │    │ Gateway  │    │ :3006    │
    │          │    │  :8000   │    │          │
    └──────────┘    └──────────┘    └──────────┘
```

### Flujo de Decisión

```
¿Qué operación necesitas?
│
├─ CRUD básico (crear, actualizar, eliminar)
│  └─> REST API
│
├─ Consulta compleja con múltiples recursos
│  └─> GraphQL
│
└─ Comunicación en tiempo real (chat, notificaciones)
   └─> WebSocket
```

---

## [CONN]  REST API Implementation

### Configuración

**Archivo:** `src/config/api.config.ts`

```typescript
export const API_CONFIG = {
  REST_API_URL: import.meta.env.VITE_REST_API_URL || 'http://localhost:3000/api/v1',
  GRAPHQL_URL: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8000/graphql',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:3006',
}
```

### Instancia de Axios

**Archivo:** `src/services/api/axiosInstance.ts`

```typescript
import axios from 'axios'
import { API_CONFIG, getAuthToken } from '../../config/api.config'

const axiosInstance = axios.create({
  baseURL: API_CONFIG.REST_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autenticación
axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Servicios REST

Cada recurso tiene su propio servicio en `src/services/api/`:

**Ejemplo:** `src/services/api/proyectosService.ts`

```typescript
import axiosInstance from './axiosInstance'
import type { Proyecto } from '../../types/proyecto.types'

class ProyectosService {
  async getAll(tipoProyecto?: 'portafolio' | 'contratado'): Promise<Proyecto[]> {
    const params = tipoProyecto ? { tipo_proyecto: tipoProyecto } : {}
    const response = await axiosInstance.get('/proyectos', { params })
    return Array.isArray(response.data) ? response.data : []
  }

  async getById(id: string): Promise<Proyecto> {
    const response = await axiosInstance.get(`/proyectos/${id}`)
    return response.data
  }

  async create(proyecto: CreateProyectoDto): Promise<Proyecto> {
    const response = await axiosInstance.post('/proyectos', { proyecto })
    return response.data
  }

  async update(id: string, proyecto: UpdateProyectoDto): Promise<Proyecto> {
    const response = await axiosInstance.put(`/proyectos/${id}`, { proyecto })
    return response.data
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/proyectos/${id}`)
  }
}

export default new ProyectosService()
```

### Uso en Componentes

**No usar servicios directamente.** Usar hooks personalizados:

```typescript
// [ERROR]  MAL
const ProyectosPage = () => {
  const [proyectos, setProyectos] = useState([])
  useEffect(() => {
    proyectosService.getAll().then(setProyectos)
  }, [])
}

// [SUCCESS]  BIEN
const ProyectosPage = () => {
  const { data: proyectos, loading } = useProyectos()
}
```

### Servicios Disponibles

- `arquitectosService.ts` - Gestión de arquitectos
- `proyectosService.ts` - Gestión de proyectos
- `valoracionesService.ts` - Gestión de valoraciones
- `conversacionesService.ts` - Gestión de conversaciones
- `incidenciasService.ts` - Gestión de incidencias
- `moderador/moderadorService.ts` - Operaciones de moderador
- `auth/authService.ts` - Autenticación

---

##  GraphQL Implementation

### Configuración de Apollo Client

**Archivo:** `src/services/graphql/apolloClient.ts`

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { API_CONFIG, getAuthToken } from '../../config/api.config'

const httpLink = createHttpLink({
  uri: API_CONFIG.GRAPHQL_URL,
})

const authLink = setContext((_, { headers }) => {
  const token = getAuthToken()
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})

export default apolloClient
```

### Provider en App

**Archivo:** `src/main.tsx`

```typescript
import { ApolloProvider } from '@apollo/client'
import apolloClient from './services/graphql/apolloClient'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={apolloClient}>
    <App />
  </ApolloProvider>
)
```

### Definición de Queries

**Archivo:** `src/services/graphql/queries.ts`

```typescript
import { gql } from '@apollo/client'

export const GET_MODERATOR_STATS = gql`
  query GetModeratorStats {
    kpisPlataforma {
      totalUsuarios
      totalProyectos
      arquitectosVerificados
      totalIncidencias
    }
  }
`

export const BUSCAR_ARQUITECTOS = gql`
  query BuscarArquitectos(
    $nombre: String
    $especialidad: String
    $valoracionMinima: Float
    $limite: Int
  ) {
    buscarArquitectos(
      nombre: $nombre
      especialidad: $especialidad
      valoracionMinima: $valoracionMinima
      limite: $limite
    ) {
      id
      cedula
      especialidades
      valoracionPromedioProyecto
      usuario {
        nombre
        apellido
        fotoPerfil
      }
    }
  }
`
```

### Uso en Componentes

```typescript
import { useQuery } from '@apollo/client'
import { GET_MODERATOR_STATS } from '../../services/graphql/queries'

const Dashboard = () => {
  const { data, loading, error } = useQuery(GET_MODERATOR_STATS, {
    fetchPolicy: 'network-only'
  })

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>Total usuarios: {data?.kpisPlataforma?.totalUsuarios}</div>
}
```

### Queries Disponibles

- `GET_MODERATOR_STATS` - KPIs de la plataforma
- `BUSCAR_ARQUITECTOS` - Búsqueda de arquitectos con filtros
- `PERFIL_COMPLETO_ARQUITECTO` - Perfil completo con proyectos
- `DASHBOARD_PROYECTO` - Dashboard completo de proyecto

---

## [CONN]  WebSocket Implementation

### Servicio de Notificaciones

**Archivo:** `src/services/websocket/notificationService.ts`

```typescript
import { io, Socket } from "socket.io-client"

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3006"

class NotificationService {
  private socket: Socket | null = null

  connect() {
    const token = localStorage.getItem('auth_token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    this.socket = io(`${WS_URL}/notificacion`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      extraHeaders: token ? {
        Authorization: `Bearer ${token}`
      } : {},
    })

    this.socket.on("connect", () => {
      if (user?.id) {
        this.socket?.emit('register_user', { usuario_id: user.id })
      }
    })

    // Escuchar eventos
    this.socket.on("nueva_notificacion", (data) => {
      // Manejar notificación
    })

    this.socket.on("proyecto:creado", (data) => {
      // Manejar proyecto creado
    })
  }
}

export const notificationService = new NotificationService()
```

### Servicio de Chat

**Archivo:** `src/services/websocket/chatService.ts`

```typescript
import { io, Socket } from "socket.io-client"

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3006"

class ChatService {
  private socket: Socket | null = null

  connect(usuarioId?: string) {
    const token = localStorage.getItem('auth_token')

    this.socket = io(`${WS_URL}/mensajes`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      extraHeaders: token ? {
        Authorization: `Bearer ${token}`
      } : {},
    })

    this.socket.on("connect", () => {
      console.log("[SUCCESS]  Conectado al chat")
    })

    this.socket.on("message:new", (mensaje) => {
      // Manejar nuevo mensaje
    })
  }

  joinConversation(conversacionId: string) {
    this.socket?.emit('join_conversation', { conversacion_id: conversacionId })
  }

  sendMessage(conversacionId: string, contenido: string) {
    this.socket?.emit('message:create', {
      conversacion_id: conversacionId,
      contenido
    })
  }
}

export const chatService = new ChatService()
```

### Integración en App

**Archivo:** `src/App.tsx`

```typescript
function WebSocketManager() {
  const { user } = useAuth()

  useEffect(() => {
    if (user && user.id) {
      // Conectar notificaciones
      notificationService.connect()
      
      // Conectar chat si es necesario
      // chatService.connect(user.id)

      return () => {
        notificationService.disconnect()
        // chatService.disconnect()
      }
    }
  }, [user])

  return null
}

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <WebSocketManager />
        <Router>
          {/* Rutas */}
        </Router>
      </AuthProvider>
    </ApolloProvider>
  )
}
```

### Hook Personalizado

**Archivo:** `src/hooks/useNotifications.ts`

```typescript
import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { notificationService } from '../services/websocket/notificationService'

export function useNotifications({ usuarioId, autoConnect = true }) {
  const [notificaciones, setNotificaciones] = useState([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!autoConnect || !usuarioId) return

    notificationService.connect()

    const unsubscribe = notificationService.onNotification((notification) => {
      setNotificaciones(prev => [notification, ...prev])
    })

    return () => {
      unsubscribe()
      notificationService.disconnect()
    }
  }, [usuarioId, autoConnect])

  return {
    notificaciones,
    isConnected,
    unreadCount: notificaciones.filter(n => !n.read).length
  }
}
```

### Eventos WebSocket Disponibles

**Namespace `/notificacion`:**
- `nueva_notificacion` - Notificación genérica
- `proyecto:creado` - Proyecto creado
- `arquitecto:verificado` - Arquitecto verificado
- `arquitecto:rechazado` - Arquitecto rechazado

**Namespace `/mensajes`:**
- `message:new` - Nuevo mensaje
- `message:typing` - Usuario escribiendo
- `join_conversation` - Unirse a conversación

---

##  Cuándo Usar Cada Tecnología

### Usar REST API cuando:

[SUCCESS]  **Operaciones CRUD básicas**
- Crear, actualizar, eliminar recursos
- Operaciones simples de un solo recurso
- Autenticación y autorización

**Ejemplos:**
- Crear un proyecto: `POST /api/v1/proyectos`
- Actualizar perfil: `PUT /api/v1/usuarios/:id`
- Eliminar valoración: `DELETE /api/v1/valoraciones/:id`

### Usar GraphQL cuando:

[SUCCESS]  **Consultas complejas**
- Necesitas datos de múltiples recursos
- Quieres evitar over-fetching/under-fetching
- Dashboards y KPIs
- Búsquedas avanzadas con filtros

**Ejemplos:**
- Dashboard de proyecto (proyecto + avances + valoraciones + incidencias)
- Perfil completo de arquitecto (arquitecto + usuario + proyectos)
- KPIs de plataforma (agregación de múltiples recursos)

### Usar WebSocket cuando:

[SUCCESS]  **Comunicación en tiempo real**
- Chat entre usuarios
- Notificaciones push instantáneas
- Actualizaciones en vivo
- Presencia online/offline

**Ejemplos:**
- Chat en tiempo real
- Notificaciones de nuevos proyectos
- Alertas de verificación de arquitecto

---

## [NOTE]  Ejemplos Prácticos

### Ejemplo 1: Crear Proyecto (REST)

```typescript
// En un componente
const crearProyecto = async () => {
  try {
    const nuevoProyecto = await proyectosService.create({
      titulo_proyecto: "Casa Moderna",
      descripcion: "Proyecto de casa moderna",
      tipo_proyecto: "contratado",
      arquitecto_id: "uuid-arquitecto"
    })
    console.log("Proyecto creado:", nuevoProyecto)
  } catch (error) {
    console.error("Error:", error)
  }
}
```

### Ejemplo 2: Obtener KPIs (GraphQL)

```typescript
import { useQuery } from '@apollo/client'
import { GET_MODERATOR_STATS } from '../services/graphql/queries'

const Dashboard = () => {
  const { data, loading } = useQuery(GET_MODERATOR_STATS)

  if (loading) return <div>Cargando...</div>

  return (
    <div>
      <h2>Total Usuarios: {data?.kpisPlataforma?.totalUsuarios}</h2>
      <h2>Total Proyectos: {data?.kpisPlataforma?.totalProyectos}</h2>
    </div>
  )
}
```

### Ejemplo 3: Recibir Notificaciones (WebSocket)

```typescript
import { useNotifications } from '../hooks/useNotifications'

const NotificationsPanel = () => {
  const { user } = useAuth()
  const { notificaciones, unreadCount } = useNotifications({
    usuarioId: user?.id,
    autoConnect: true
  })

  return (
    <div>
      <h3>Notificaciones ({unreadCount} sin leer)</h3>
      {notificaciones.map(notif => (
        <div key={notif.id}>
          <p>{notif.data.mensaje}</p>
        </div>
      ))}
    </div>
  )
}
```

### Ejemplo 4: Chat en Tiempo Real (WebSocket)

```typescript
import { useEffect, useState } from 'react'
import { chatService } from '../services/websocket/chatService'

const ChatComponent = ({ conversacionId }) => {
  const [mensajes, setMensajes] = useState([])

  useEffect(() => {
    chatService.connect()
    chatService.joinConversation(conversacionId)

    chatService.onMessage((mensaje) => {
      setMensajes(prev => [...prev, mensaje])
    })

    return () => {
      chatService.disconnect()
    }
  }, [conversacionId])

  const enviarMensaje = (contenido: string) => {
    chatService.sendMessage(conversacionId, contenido)
  }

  return (
    <div>
      {mensajes.map(msg => (
        <div key={msg.id}>{msg.contenido}</div>
      ))}
      <button onClick={() => enviarMensaje("Hola")}>
        Enviar
      </button>
    </div>
  )
}
```

---

## ️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz de `frontend/`:

```env
VITE_REST_API_URL=http://localhost:3000/api/v1
VITE_GRAPHQL_URL=http://localhost:8000/graphql
VITE_WS_URL=http://localhost:3006
```

### Autenticación

El token de autenticación se almacena en `localStorage` como `auth_token` y se incluye automáticamente en:

- **REST API**: Header `Authorization: Bearer <token>`
- **GraphQL**: Header `authorization: Bearer <token>`
- **WebSocket**: Header `Authorization: Bearer <token>` en `extraHeaders`

### Manejo de Errores

Todos los servicios incluyen manejo de errores:

```typescript
// REST API
try {
  const data = await proyectosService.getAll()
} catch (error) {
  if (error.response?.status === 401) {
    // Token inválido, redirigir a login
  }
}

// GraphQL
const { data, error } = useQuery(GET_STATS)
if (error) {
  console.error("Error GraphQL:", error)
}

// WebSocket
socket.on("connect_error", (error) => {
  console.error("Error de conexión:", error)
})
```

---

##  Recursos Adicionales

- [Axios Documentation](https://axios-http.com/docs/intro)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Socket.io Client Documentation](https://socket.io/docs/v4/client-api/)
- [REST API Docs](../docs/APIREST.md)
- [GraphQL Docs](../docs/graphql.md)
- [WebSocket Docs](../docs/WEBSOCKET_INTEGRATION.md)

---

## [PROXY]  Flujo Completo de Ejemplo

### Caso: Cliente busca arquitecto y crea proyecto

```typescript
// 1. Búsqueda de arquitectos (GraphQL - consulta compleja)
const { data } = useQuery(BUSCAR_ARQUITECTOS, {
  variables: {
    especialidad: "Residencial",
    valoracionMinima: 4.0
  }
})

// 2. Ver detalle de arquitecto (REST - recurso simple)
const arquitecto = await arquitectosService.getById(arquitectoId)

// 3. Crear solicitud de proyecto (REST - operación CRUD)
const solicitud = await solicitudesService.create({
  proyecto_id: proyectoId,
  arquitecto_id: arquitectoId,
  mensaje: "Me interesa tu trabajo"
})

// 4. Arquitecto acepta y crea proyecto (REST)
const proyecto = await proyectosService.create({
  titulo_proyecto: "Casa Moderna",
  tipo_proyecto: "contratado",
  arquitecto_id: arquitectoId,
  cliente_id: clienteId
})

// 5. Cliente recibe notificación en tiempo real (WebSocket)
// El WebSocket automáticamente emite "proyecto:creado" al cliente
// El componente escucha y muestra la notificación

// 6. Chat en tiempo real (WebSocket)
chatService.joinConversation(conversacionId)
chatService.sendMessage(conversacionId, "Hola, ¿cómo va el proyecto?")
```

---

**Hecho con ️ por el equipo de ArquiPro**


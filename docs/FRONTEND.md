# Frontend - ArquiPro# Frontend - ArquiPro# Frontend - ArquiPro



Aplicación web desarrollada en **React + TypeScript** con **Vite** que consume múltiples servicios backend.



## [LIST]  Tabla de ContenidosAplicación web desarrollada en **React + TypeScript** con **Vite** que consume el backend de Rails (REST API) y GraphQL.Aplicación web desarrollada en **React + TypeScript** con **Vite** que consume el backend de Rails (REST API) y GraphQL.



- [Tecnologías](#tecnologías)import reactDom from 'eslint-plugin-react-dom'

- [Arquitectura](#arquitectura)

- [Estructura del Proyecto](#estructura-del-proyecto)## [LIST]  Tabla de Contenidos

- [Instalación](#instalación)

- [Ejecución](#ejecución)export default defineConfig([

- [Convenciones de Código](#convenciones-de-código)

- [Flujo de Datos](#flujo-de-datos)- [Tecnologías](#tecnologías)  globalIgnores(['dist']),



---- [Arquitectura](#arquitectura)  {



## ️ Tecnologías- [Estructura del Proyecto](#estructura-del-proyecto)    files: ['**/*.{ts,tsx}'],



- **React 18**: Biblioteca para construir interfaces de usuario- [Instalación](#instalación)    extends: [

- **TypeScript**: Tipado estático para JavaScript

- **Vite**: Herramienta de desarrollo rápida- [Ejecución](#ejecución)      // Other configs...

- **React Router**: Enrutamiento de páginas

- **Axios**: Cliente HTTP para consumir REST API- [Convenciones de Código](#convenciones-de-código)      // Enable lint rules for React

- **Socket.io Client**: Cliente WebSocket para tiempo real

- **Apollo Client** *(opcional)*: Cliente GraphQL- [Flujo de Datos](#flujo-de-datos)      reactX.configs['recommended-typescript'],

- **Tailwind CSS**: Framework CSS utility-first

- **React Hook Form**: Manejo de formularios      // Enable lint rules for React DOM



------      reactDom.configs.recommended,



## ️ Arquitectura    ],



```## ️ Tecnologías    languageOptions: {

┌───────────────────────────────────────────────────────────────────┐

│                          FRONTEND                                  │      parserOptions: {

│                      (React + TypeScript)                          │

│                                                                     │- **React 18**: Biblioteca para construir interfaces de usuario        project: ['./tsconfig.node.json', './tsconfig.app.json'],

│  - Interfaz de usuario interactiva                                │

│  - Dashboard con reportes en tiempo real                          │- **TypeScript**: Tipado estático para JavaScript        tsconfigRootDir: import.meta.dirname,

│  - Gestión de proyectos, arquitectos, conversaciones             │

└───────────────────────────────────────────────────────────────────┘- **Vite**: Herramienta de desarrollo rápida      },

                                 │

            ┌────────────────────┼────────────────────┐- **React Router**: Enrutamiento de páginas      // other options...

            │                    │                    │

            ▼                    ▼                    ▼- **Axios**: Cliente HTTP para consumir REST API    },

  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐

  │   REST API       │ │   GraphQL API    │ │   WebSocket      │- **Tailwind CSS**: Framework CSS utility-first  },

  │   (Rails)        │ │   (Python/NestJS)│ │   (Node.js)      │

  │                  │ │                  │ │                  │- **React Hook Form**: Manejo de formularios])

  │ [SUCCESS]  CRUD          │ │ [SUCCESS]  Búsquedas     │ │ [SUCCESS]  Mensajes RT   │

  │ [SUCCESS]  Auth          │ │ [SUCCESS]  Agregaciones  │ │ [SUCCESS]  Notificaciones│```

  │ [SUCCESS]  Upload        │ │ [SUCCESS]  Métricas      │ │ [SUCCESS]  Estado online │

  │ [SUCCESS]  Validaciones  │ │ [SUCCESS]  Dashboards    │ │ [SUCCESS]  Typing...     │---

  └──────────────────┘ └──────────────────┘ └──────────────────┘

           │                     │                     │## ️ Arquitectura

           └─────────────────────┴─────────────────────┘

                                 │```

                                 ▼┌─────────────────────────────────────────────────────────────┐

                    ┌──────────────────────┐│                        FRONTEND                              │

                    │   PostgreSQL         ││                     (React + TypeScript)                     │

                    │   (Supabase)         │└─────────────────────────────────────────────────────────────┘

                    │                      │                              │

                    │ 15 tablas            │                ┌─────────────┴──────────────┐

                    │ 163 registros        │                │                            │

                    └──────────────────────┘                ▼                            ▼

```    ┌──────────────────┐        ┌──────────────────┐

    │   REST API       │        │   GraphQL API    │

### Estrategia de Comunicación    │   (Rails)        │        │   (Python/NestJS)│

    │                  │        │                  │

| Servicio | Uso | Ejemplos |    │ - Autenticación  │        │ - Queries        │

|----------|-----|----------|    │ - CRUD           │        │ - Agregación     │

| **REST API** | CRUD, Autenticación, Operaciones básicas | Login, crear proyecto, subir imagen |    │ - Mutations      │        │ - Métricas       │

| **GraphQL** | Consultas complejas, Reportes, Agregaciones | Dashboard, búsqueda de arquitectos, métricas |    └──────────────────┘        └──────────────────┘

| **WebSocket** | Comunicación en tiempo real | Chat, notificaciones, presencia online |```



### Patrón: Feature-Based + Atomic Design### Patrón: Feature-Based + Atomic Design



- **Feature-Based**: Organización por funcionalidades- **Feature-Based**: Organización por funcionalidades

- **Atomic Design**: Componentes reutilizables- **Atomic Design**: Componentes reutilizables

- **Separation of Concerns**: Lógica separada de UI- **Separation of Concerns**: Lógica separada de UI



------



## [DIR]  Estructura del Proyecto## [DIR]  Estructura del Proyecto



``````

frontend/src/frontend/src/

├── config/                  # [TOOL]  Configuración├── config/                  # [TOOL]  Configuración

│   ├── api.config.ts        # URLs de REST, GraphQL, WebSocket│   ├── api.config.ts        # URLs de APIs

│   ├── routes.config.ts     # Rutas de la app│   ├── routes.config.ts     # Rutas de la app

│   └── README.md│   └── README.md

││

├── services/                # [SIGNAL]  Comunicación con Backend├── services/                # [SIGNAL]  Comunicación con Backend

│   ├── api/                 # REST API│   ├── api/

│   │   ├── axiosInstance.ts│   │   ├── axiosInstance.ts

│   │   ├── authService.ts│   │   ├── authService.ts

│   │   ├── proyectosService.ts│   │   ├── usuariosService.ts

│   │   └── arquitectosService.ts│   │   ├── proyectosService.ts

│   ││   │   └── arquitectosService.ts

│   ├── graphql/             # GraphQL│   └── README.md

│   │   ├── apolloClient.ts│

│   │   └── queries/├── types/                   # [BATCH]  Tipos TypeScript

│   │       ├── buscarArquitectos.ts│   ├── usuario.types.ts

│   │       └── dashboardProyecto.ts│   ├── proyecto.types.ts

│   ││   ├── api.types.ts

│   ├── websocket/           # WebSocket│   └── README.md

│   │   ├── socketClient.ts│

│   │   ├── chatHandlers.ts├── hooks/                   #  Custom Hooks

│   │   └── notificationHandlers.ts│   ├── useAuth.ts

│   ││   ├── useProyectos.ts

│   └── README.md│   ├── useDebounce.ts

││   └── README.md

├── types/                   # [BATCH]  Tipos TypeScript│

│   ├── usuario.types.ts├── contexts/                # [NET]  Context API

│   ├── proyecto.types.ts│   ├── AuthContext.tsx

│   ├── api.types.ts│   ├── ThemeContext.tsx

│   ├── graphql.types.ts│   └── README.md

│   ├── websocket.types.ts│

│   └── README.md├── utils/                   # ️ Utilidades

││   ├── formatters.ts

├── hooks/                   #  Custom Hooks│   ├── validators.ts

│   ├── useAuth.ts│   ├── constants.ts

│   ├── useProyectos.ts│   └── README.md

│   ├── useWebSocket.ts      # Hook para WebSocket│

│   ├── useChat.ts           # Hook para chat en tiempo real├── components/              #  Componentes

│   └── README.md│   ├── common/              # Reutilizables

││   │   ├── Button/

├── contexts/                # [NET]  Context API│   │   ├── Input/

│   ├── AuthContext.tsx│   │   ├── Card/

│   ├── ThemeContext.tsx│   │   ├── Modal/

│   ├── WebSocketContext.tsx # Context de WebSocket│   │   └── README.md

│   └── README.md│   │

││   └── layout/              # Layout

├── utils/                   # ️ Utilidades│       ├── Header/

│   ├── formatters.ts│       ├── Sidebar/

│   ├── validators.ts│       ├── Footer/

│   ├── constants.ts│       └── README.md

│   └── README.md│

│└── pages/                   # [DOC]  Páginas

├── components/              #  Componentes    ├── Home/

│   ├── common/              # Reutilizables    ├── Auth/

│   │   ├── Button/    ├── Arquitectos/

│   │   ├── Input/    ├── Proyectos/

│   │   ├── Card/    ├── Conversaciones/

│   │   └── README.md    └── README.md

│   │```

│   └── layout/              # Layout

│       ├── Header/Cada carpeta tiene su propio **README.md** explicando su propósito y ejemplos de uso.

│       ├── Sidebar/

│       └── README.md---

│

└── pages/                   # [DOC]  Páginas## [START]  Instalación

    ├── Home/

    ├── Auth/```bash

    ├── Arquitectos/cd frontend

    ├── Proyectos/npm install

    ├── Conversaciones/      # Chat en tiempo real (WebSocket)

    ├── Dashboard/           # Reportes (GraphQL)# Dependencias adicionales

    └── README.mdnpm install react-router-dom axios react-hook-form

```

# Tailwind CSS

Cada carpeta tiene su propio **README.md** explicando su propósito y ejemplos de uso.npm install -D tailwindcss postcss autoprefixer

npx tailwindcss init -p

---```



## [START]  Instalación**Configurar `.env`:**



```bash```env

cd frontendVITE_API_BASE_URL=http://localhost:3000/api/v1

npm installVITE_GRAPHQL_URL=http://localhost:8000/graphql

```

# Dependencias principales

npm install react-router-dom axios socket.io-client---



# GraphQL (opcional pero recomendado)## ▶️ Ejecución

npm install @apollo/client graphql

```bash

# Formularios# Desarrollo

npm install react-hook-formnpm run dev



# Tailwind CSS# Producción

npm install -D tailwindcss postcss autoprefixernpm run build

npx tailwindcss init -pnpm run preview

``````



**Configurar `.env`:**Aplicación disponible en: **http://localhost:5173**



```env---

# REST API (Rails)

VITE_API_BASE_URL=http://localhost:3000/api/v1## [NOTE]  Convenciones de Código



# GraphQL API (Python/NestJS)### Nombres de Archivos

VITE_GRAPHQL_URL=http://localhost:8000/graphql

- **Componentes**: `PascalCase.tsx` → `Button.tsx`

# WebSocket (Node.js)- **Hooks**: `camelCase.ts` → `useAuth.ts`

VITE_WS_URL=http://localhost:3001- **Services**: `camelCase.ts` → `authService.ts`

```- **Tipos**: `camelCase.types.ts` → `usuario.types.ts`



---### Estructura de Componente



## ▶️ Ejecución```tsx

import React from 'react';

```bash

# Desarrollointerface Props {

npm run dev  title: string;

  onSubmit: () => void;

# Producción}

npm run build

npm run previewexport const MyComponent: React.FC<Props> = ({ title, onSubmit }) => {

```  const [state, setState] = React.useState('');



Aplicación disponible en: **http://localhost:5173**  const handleClick = () => {

    // lógica

---  };



## [NOTE]  Convenciones de Código  return (

    <div>

### Nombres de Archivos      <h1>{title}</h1>

      <button onClick={handleClick}>Click</button>

- **Componentes**: `PascalCase.tsx` → `Button.tsx`    </div>

- **Hooks**: `camelCase.ts` → `useAuth.ts`  );

- **Services**: `camelCase.ts` → `authService.ts`};

- **Tipos**: `camelCase.types.ts` → `usuario.types.ts````



### Estructura de Componente### Orden de Imports



```tsx```tsx

import React from 'react';// 1. React y librerías

import React, { useState } from 'react';

interface Props {import { useNavigate } from 'react-router-dom';

  title: string;

  onSubmit: () => void;// 2. Hooks y contextos

}import { useAuth } from '@/hooks/useAuth';



export const MyComponent: React.FC<Props> = ({ title, onSubmit }) => {// 3. Componentes

  const [state, setState] = React.useState('');import { Button } from '@/components/common/Button';



  const handleClick = () => {// 4. Tipos

    // lógicaimport { Usuario } from '@/types/usuario.types';

  };

// 5. Servicios y utils

  return (import { usuariosService } from '@/services/api/usuariosService';

    <div>import { formatDate } from '@/utils/formatters';

      <h1>{title}</h1>

      <button onClick={handleClick}>Click</button>// 6. Estilos

    </div>import './MyComponent.css';

  );```

};

```---



### Orden de Imports## [PROXY]  Flujo de Datos



```tsx### 1. Autenticación (REST)

// 1. React y librerías

import React, { useState } from 'react';```

import { useNavigate } from 'react-router-dom';LoginPage → authService.login() → Rails API

     ↓

// 2. Hooks y contextosGuardar token en Context

import { useAuth } from '@/hooks/useAuth';     ↓

import { useWebSocket } from '@/hooks/useWebSocket';Redirect a Dashboard

```

// 3. Componentes

import { Button } from '@/components/common/Button';### 2. CRUD (REST)



// 4. Tipos```

import { Usuario } from '@/types/usuario.types';Page → Hook (useProyectos) → Service → Rails API

            ↓

// 5. Servicios y utils    Actualizar estado

import { usuariosService } from '@/services/api/usuariosService';            ↓

import { formatDate } from '@/utils/formatters';    Re-render

```

// 6. Estilos

import './MyComponent.css';### 3. Queries Complejas (GraphQL)

```

```

---DashboardPage → GraphQL Query → GraphQL Gateway

                      ↓

## [PROXY]  Flujo de Datos            Componente se actualiza

```

### 1. Autenticación (REST)

---

```

LoginPage → authService.login() → Rails API##  Guías Rápidas

     ↓

Guardar token en Context### Crear una Página

     ↓

Redirect a Dashboard```tsx

```// src/pages/Proyectos/ProyectosListPage.tsx

import React from 'react';

### 2. CRUD (REST)import { useProyectos } from '@/hooks/useProyectos';



```export const ProyectosListPage: React.FC = () => {

Page → Hook (useProyectos) → Service → Rails API  const { proyectos, loading } = useProyectos();

            ↓

    Actualizar estado  if (loading) return <div>Cargando...</div>;

            ↓

    Re-render  return (

```    <div>

      <h1>Proyectos</h1>

### 3. Queries Complejas (GraphQL)      {proyectos.map(p => (

        <div key={p.id}>{p.titulo}</div>

```      ))}

DashboardPage → GraphQL Query → GraphQL Gateway    </div>

                      ↓  );

            Agregar datos de múltiples fuentes};

                      ↓```

            Componente se actualiza

```### Crear un Hook



### 4. Comunicación Tiempo Real (WebSocket)```tsx

// src/hooks/useProyectos.ts

```import { useState, useEffect } from 'react';

ConversacionPage → useWebSocket → Socket.io Clientimport { proyectosService } from '@/services/api/proyectosService';

                         ↓

              Escuchar evento 'nuevo_mensaje'export const useProyectos = () => {

                         ↓  const [proyectos, setProyectos] = useState([]);

              Actualizar lista de mensajes  const [loading, setLoading] = useState(true);

                         ↓

              Re-render automático  useEffect(() => {

```    proyectosService.getAll()

      .then(setProyectos)

---      .finally(() => setLoading(false));

  }, []);

##  Guías Rápidas

  return { proyectos, loading };

### Crear una Página};

```

```tsx

// src/pages/Proyectos/ProyectosListPage.tsx### Consumir REST API

import React from 'react';

import { useProyectos } from '@/hooks/useProyectos';```tsx

// src/services/api/proyectosService.ts

export const ProyectosListPage: React.FC = () => {import { axiosInstance } from './axiosInstance';

  const { proyectos, loading } = useProyectos();

export const proyectosService = {

  if (loading) return <div>Cargando...</div>;  getAll: async () => {

    const response = await axiosInstance.get('/proyectos');

  return (    return response.data;

    <div>  },

      <h1>Proyectos</h1>

      {proyectos.map(p => (  getById: async (id: string) => {

        <div key={p.id}>{p.titulo}</div>    const response = await axiosInstance.get(`/proyectos/${id}`);

      ))}    return response.data;

    </div>  },

  );

};  create: async (data: any) => {

```    const response = await axiosInstance.post('/proyectos', { proyecto: data });

    return response.data;

### Consumir REST API  },

};

```tsx```

// src/services/api/proyectosService.ts

import { axiosInstance } from './axiosInstance';---



export const proyectosService = {##  Recursos

  getAll: async () => {

    const response = await axiosInstance.get('/proyectos');- [React Docs](https://react.dev/)

    return response.data;- [TypeScript](https://www.typescriptlang.org/docs/)

  },- [Vite](https://vitejs.dev/guide/)

- [React Router](https://reactrouter.com/)

  create: async (data: any) => {- [Tailwind CSS](https://tailwindcss.com/docs)

    const response = await axiosInstance.post('/proyectos', { proyecto: data });

    return response.data;---

  },

};## [DOC]  Licencia

```

Proyecto desarrollado para ArquiPro © 2025

### Consumir GraphQL

```tsx
// src/pages/Dashboard/DashboardPage.tsx
import { useQuery } from '@apollo/client';
import { DASHBOARD_PROYECTO } from '@/services/graphql/queries/dashboardProyecto';

export const DashboardPage: React.FC = () => {
  const { data, loading } = useQuery(DASHBOARD_PROYECTO, {
    variables: { proyectoId: '1' },
  });

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>{data.dashboardProyecto.proyecto.titulo}</h1>
      <p>Total avances: {data.dashboardProyecto.estadisticas.totalAvances}</p>
    </div>
  );
};
```

### Usar WebSocket

```tsx
// src/pages/Conversaciones/ChatPage.tsx
import { useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

export const ChatPage: React.FC = () => {
  const { socket, isConnected } = useWebSocket();
  const [mensajes, setMensajes] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Escuchar nuevos mensajes
    socket.on('nuevo_mensaje', (mensaje) => {
      setMensajes(prev => [...prev, mensaje]);
    });

    // Unirse a sala de conversación
    socket.emit('join_conversacion', { conversacionId: '123' });

    return () => {
      socket.off('nuevo_mensaje');
    };
  }, [socket]);

  const enviarMensaje = (contenido: string) => {
    socket?.emit('enviar_mensaje', {
      conversacionId: '123',
      contenido,
    });
  };

  return (
    <div>
      <div>{isConnected ? '[ONLINE]  Conectado' : ' Desconectado'}</div>
      {mensajes.map(m => <div key={m.id}>{m.contenido}</div>)}
      <button onClick={() => enviarMensaje('Hola')}>Enviar</button>
    </div>
  );
};
```

---

##  Casos de Uso por Servicio

### REST API (Rails)
[SUCCESS]  Login/Registro/Logout  
[SUCCESS]  CRUD de proyectos, usuarios, arquitectos  
[SUCCESS]  Upload de imágenes  
[SUCCESS]  Validaciones y autorizaciones  
[SUCCESS]  Solicitudes de proyecto  
[SUCCESS]  Valoraciones  

### GraphQL
[SUCCESS]  Búsqueda avanzada de arquitectos (filtros múltiples)  
[SUCCESS]  Dashboard de proyecto (estadísticas + últimos avances + mensajes)  
[SUCCESS]  Estadísticas de arquitecto (proyectos, calificaciones)  
[SUCCESS]  Métricas de plataforma  
[SUCCESS]  Reportes complejos  

### WebSocket
[SUCCESS]  Chat en tiempo real  
[SUCCESS]  Notificaciones instantáneas  
[SUCCESS]  Estado "escribiendo..." en chat  
[SUCCESS]  Presencia online/offline  
[SUCCESS]  Actualizaciones de estado de proyecto  

---

##  Recursos

- [React Docs](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Vite](https://vitejs.dev/guide/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## � Sistema de Caché con localStorage

El frontend implementa un **sistema de caché automático** que reduce las llamadas repetitivas al backend, mejorando el rendimiento y la experiencia del usuario.

###  Características

- [SUCCESS]  **Caché automático** en `localStorage`
- [SUCCESS]  **Expiración temporal** (5 minutos por defecto)
- [SUCCESS]  **Validación de parámetros** (solo usa caché si los filtros coinciden)
- [SUCCESS]  **Limpieza automática** cuando el storage se llena
- [SUCCESS]  **Soporte multi-servicio** (REST API + GraphQL)

###  Servicios con Caché

#### 1. REST API - Arquitectos
```typescript
import arquitectosService from '@/services/api/arquitectosService'

// Todos con caché automático:
const { arquitectos } = await arquitectosService.getAll()
const arquitecto = await arquitectosService.getById(id)
const verificados = await arquitectosService.getVerificados()
const results = await arquitectosService.search('query')

// Limpiar caché manualmente:
arquitectosService.clearCache()
```

#### 2. GraphQL - Búsqueda de Arquitectos
```typescript
import { useBuscarArquitectos } from '@/services/graphql/arquitectosGraphQL'

function FindArchitects() {
  const { data, loading, error, refetch } = useBuscarArquitectos({
    especialidad: 'moderno',
    limite: 20
  })

  // refetch() limpia el caché y consulta de nuevo
  return <ArchitectsList data={data} onRefresh={refetch} />
}
```

#### 3. Hooks Genéricos Disponibles
```typescript
import {
  useProyectos,         // Lista de proyectos
  useProyecto,          // Proyecto individual
  useValoraciones,      // Valoraciones
  useNotificaciones,    // Notificaciones
  useConversaciones,    // Conversaciones
  useMensajes,          // Mensajes
  useUsuarioPerfil,     // Perfil de usuario
  useEstadisticas       // Estadísticas
} from '@/hooks/useApiWithCache'

function MiComponente() {
  const { data, loading, error, refetch } = useProyectos()
  
  if (loading) return <Spinner />
  if (error) return <Error />
  return <ProyectosList data={data} />
}
```

###  Beneficios

| Métrica | Antes | Ahora | Mejora |
|---------|-------|-------|--------|
| Navegación Home ↔ FindArchitects | 2 queries | 1 query | **50% menos** |
| Tiempo de carga (visitas repetidas) | 300-500ms | 0ms (instantáneo) | **100% más rápido** |
| Carga en servidor backend | Alta | Baja | **Reducción significativa** |

###  Documentación Completa

- **Guía del sistema**: `src/services/CACHE_SYSTEM.md`
- **Ejemplos de hooks**: `src/hooks/HOOKS_WITH_CACHE.md`
- **Resumen completo**: `CACHE_IMPLEMENTATION_SUMMARY.md`

### [TOOL]  Configuración

Para cambiar la duración del caché, modifica la constante en el servicio:

```typescript
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutos
```

Para limpiar todo el caché:

```typescript
import { CacheService } from '@/utils/cacheService'

CacheService.clearAll() // Limpia todos los cachés
```

---

## �[DOC]  Documentación Adicional

- [Backend REST API](../docs/APIREST.md)
- [GraphQL Python](../docs/GRAPHQL.md)
- [GraphQL NestJS](../docs/GRAPHQL_NESTJS.md)
- [WebSocket](../backend/websocket/)
- **[Sistema de Caché](./CACHE_IMPLEMENTATION_SUMMARY.md)** ⭐

---

**Proyecto desarrollado para ArquiPro © 2025**


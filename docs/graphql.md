#  GraphQL Gateway - ArquiPro

Servicio GraphQL desarrollado en **Python 3.11+** con **FastAPI** y **Strawberry GraphQL** que actúa como gateway de agregación sobre la API REST de Rails.

> **Nota:** Este servicio NO reemplaza la API REST. Usa REST para CRUD y GraphQL para consultas complejas. Ver [Frontend Implementation Guide](../frontend/FRONTEND_IMPLEMENTATION.md) para más detalles.

## [LIST]  Tabla de Contenidos

- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Propósito del Servicio](#propósito-del-servicio)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Queries Disponibles](#queries-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Ventajas sobre REST](#ventajas-sobre-rest)
- [Limitaciones](#limitaciones)
- [Troubleshooting](#troubleshooting)

---

## ️ Tecnologías

- **Python**: 3.11+
- **FastAPI**: Framework web asíncrono
- **Strawberry GraphQL**: Biblioteca GraphQL para Python
- **httpx**: Cliente HTTP asíncrono para consumir la API REST
- **Uvicorn**: Servidor ASGI de alto rendimiento

---

## ️ Arquitectura

```
┌─────────────────┐
│   Frontend      │
│   (React/Vue)   │
└────────┬────────┘
         │ GraphQL Query
         ▼
┌─────────────────┐
│  GraphQL Server │ ◄── Este servicio
│  (FastAPI +     │
│   Strawberry)   │
└────────┬────────┘
         │ REST HTTP
         ▼
┌─────────────────┐
│   API REST      │
│   (Rails)       │
└─────────────────┘
```

### Patrón Gateway

Este servicio NO reemplaza la API REST, sino que actúa como **capa de agregación** que:

1. **Consume** múltiples endpoints REST de Rails
2. **Combina** datos de diferentes recursos en una sola query
3. **Transforma** respuestas REST en tipos GraphQL estructurados
4. **Optimiza** reduciendo el número de peticiones HTTP desde el frontend

---

##  Propósito del Servicio

### ¿Por qué GraphQL sobre REST?

**REST API (Rails)** maneja:
- [SUCCESS]  CRUD individual de recursos
- [SUCCESS]  Autenticación y autorización
- [SUCCESS]  Lógica de negocio y validaciones
- [SUCCESS]  Persistencia en base de datos

**GraphQL Gateway** maneja:
- [SUCCESS]  Consultas complejas con múltiples recursos
- [SUCCESS]  Agregación de datos (dashboards, perfiles completos)
- [SUCCESS]  Métricas y estadísticas calculadas
- [SUCCESS]  Búsquedas avanzadas con filtros

### Casos de Uso Principales

1. **Perfil completo de arquitecto** → 1 query GraphQL = 3+ peticiones REST
2. **Dashboard de proyecto** → Datos de proyecto + avances + valoraciones + incidencias
3. **KPIs de plataforma** → Agregación de usuarios + proyectos + estadísticas
4. **Búsquedas complejas** → Filtrado y agregación de múltiples recursos

---

## [LIST]  Requisitos Previos

- **Python** 3.11 o superior → [Descargar Python](https://www.python.org/downloads/)
- **pip** (incluido con Python)
- **API REST funcionando** en `http://localhost:3000`

---

## [START]  Instalación

```bash
# 1. Navegar al directorio del servicio
cd c:\Users\leoan\Desktop\arqui-pro\backend\graphql

# 2. Crear entorno virtual (recomendado)
python -m venv venv

# 3. Activar entorno virtual
# Windows CMD
venv\Scripts\activate.bat

# Windows PowerShell
venv\Scripts\Activate.ps1

# 4. Instalar dependencias
pip install -r requirements.txt
```

### Dependencias principales

```txt
fastapi==0.115.6
strawberry-graphql[fastapi]==0.254.2
httpx==0.28.1
uvicorn[standard]==0.34.0
```

---

## ️ Configuración

### Variables de Entorno

Crea un archivo `.env` en `backend/graphql/`:

```env
# URL base de la API REST
REST_API_BASE_URL=http://localhost:3000/api/v1

# Puerto del servidor GraphQL
GRAPHQL_PORT=8000

# Modo de ejecución
ENVIRONMENT=development
```

### Archivo de Configuración

El archivo `infrastructure/rest_client.py` maneja la conexión con la API REST:

```python
import httpx
import os

BASE_URL = os.getenv("REST_API_BASE_URL", "http://localhost:3000/api/v1")

async def get_rest_data(endpoint: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}{endpoint}")
        response.raise_for_status()
        return response.json()
```

---

## ▶️ Ejecución

### Desarrollo

```bash
cd c:\Users\leoan\Desktop\arqui-pro\backend\graphql
python main.py
```

El servidor estará disponible en:
- **GraphQL Playground**: http://localhost:8000/graphql
- **API Docs**: http://localhost:8000/docs

### Producción

```bash
python -m uvicorn main:app --reload
```

---

## [CONN]  Queries Disponibles

El servicio expone **9 queries especializadas** organizadas en 3 categorías:

### [METRICS]  1. Agregación (3 queries)

#### 1.1 `perfilCompletoArquitecto`
Obtiene el perfil completo de un arquitecto con sus proyectos.

**Entrada:**
- `arquitectoId: ID!`

**Retorna:** `PerfilCompletoArquitecto`
- Datos del arquitecto
- Usuario asociado (nombre, email, teléfono)
- Lista completa de proyectos

**Ejemplo:**
```graphql
query {
  perfilCompletoArquitecto(arquitectoId: "123") {
    arquitecto {
      id
      cedula_profesional
      especialidad
      anios_experiencia
      usuario {
        id
        nombre
        apellido
        email
        telefono
      }
    }
    proyectos {
      id
      titulo
      descripcion
      estado_proyecto
      presupuesto
      fecha_publicacion
    }
  }
}
```

**Consumo REST equivalente:**
```
GET /api/v1/arquitectos/123
GET /api/v1/usuarios/:usuario_id
GET /api/v1/proyectos?arquitecto_id=123
```

---

#### 1.2 `dashboardProyecto`
Dashboard completo de un proyecto con todos sus recursos relacionados.

**Entrada:**
- `proyectoId: ID!`

**Retorna:** `DashboardProyecto`
- Datos del proyecto
- Arquitecto + usuario del arquitecto
- Cliente + usuario del cliente
- Avances del proyecto
- Valoraciones recibidas
- Incidencias reportadas

**Ejemplo:**
```graphql
query {
  dashboardProyecto(proyectoId: "456") {
    proyecto {
      id
      titulo
      descripcion
      estado_proyecto
      presupuesto
      fecha_inicio
      fecha_fin_estimada
      arquitecto {
        cedula_profesional
        especialidad
        usuario {
          nombre
          apellido
        }
      }
      cliente {
        usuario {
          nombre
          apellido
        }
      }
    }
    avances {
      id
      descripcion
      porcentaje_avance
      fecha
    }
    valoraciones {
      id
      puntuacion
      comentario
      fecha
    }
    incidencias {
      id
      descripcion
      estado
      fecha_reporte
    }
  }
}
```

**Consumo REST equivalente:**
```
GET /api/v1/proyectos/456
GET /api/v1/arquitectos/:arquitecto_id
GET /api/v1/usuarios/:usuario_arquitecto_id
GET /api/v1/clientes/:cliente_id
GET /api/v1/usuarios/:usuario_cliente_id
GET /api/v1/avances?proyecto_id=456
GET /api/v1/valoraciones?proyecto_id=456
GET /api/v1/incidencias?proyecto_id=456
```

---

#### 1.3 `historialConversacion`
Historial completo de una conversación con mensajes y participantes.

**Entrada:**
- `conversacionId: ID!`

**Retorna:** `HistorialConversacion`
- Datos de la conversación
- Cliente + usuario del cliente
- Arquitecto + usuario del arquitecto
- Lista de mensajes ordenados

**Ejemplo:**
```graphql
query {
  historialConversacion(conversacionId: "789") {
    conversacion {
      id
      titulo
      fecha
      cliente {
        usuario {
          nombre
          apellido
        }
      }
      arquitecto {
        usuario {
          nombre
          apellido
        }
      }
    }
    mensajes {
      id
      contenido
      fecha_envio
      usuario_emisor_id
      leido
    }
  }
}
```

**Consumo REST equivalente:**
```
GET /api/v1/conversaciones/789
GET /api/v1/clientes/:cliente_id
GET /api/v1/usuarios/:usuario_cliente_id
GET /api/v1/arquitectos/:arquitecto_id
GET /api/v1/usuarios/:usuario_arquitecto_id
GET /api/v1/mensajes?conversacion_id=789
```

---

### [STATS]  2. Métricas (3 queries)

#### 2.1 `estadisticasArquitecto`
Estadísticas completas de un arquitecto.

**Entrada:**
- `arquitectoId: ID!`

**Retorna:** `EstadisticasArquitecto`
- Total de proyectos
- Proyectos activos/completados/cancelados
- Proyectos por tipo (residencial, comercial, etc.)
- Valoración promedio
- Usuario asociado

**Ejemplo:**
```graphql
query {
  estadisticasArquitecto(arquitectoId: "123") {
    arquitecto {
      usuario {
        nombre
        apellido
      }
    }
    total_proyectos
    proyectos_completados
    proyectos_activos
    proyectos_cancelados
    valoracion_promedio
    proyectos_por_tipo {
      tipo
      cantidad
    }
  }
}
```

---

#### 2.2 `kpisPlataforma`
KPIs globales de la plataforma.

**Entrada:** Ninguna

**Retorna:** `KPIsPlataforma`
- Total de usuarios
- Usuarios por rol (clientes, arquitectos, moderadores)
- Total de proyectos
- Proyectos por estado
- Valoración promedio global

**Ejemplo:**
```graphql
query {
  kpisPlataforma {
    total_usuarios
    usuarios_por_rol {
      rol
      cantidad
    }
    total_proyectos
    proyectos_activos
    proyectos_completados
    valoracion_promedio_global
  }
}
```

---

#### 2.3 `metricsProyecto`
Métricas calculadas de un proyecto específico.

**Entrada:**
- `proyectoId: ID!`

**Retorna:** `MetricasProyecto`
- Progreso total (promedio de avances)
- Número de incidencias abiertas/cerradas
- Tiempo transcurrido vs estimado
- Días restantes para finalización

**Ejemplo:**
```graphql
query {
  metricsProyecto(proyectoId: "456") {
    proyecto {
      titulo
      estado_proyecto
    }
    progreso_total
    incidencias_abiertas
    incidencias_cerradas
    dias_transcurridos
    dias_restantes
  }
}
```

---

### [SEARCH]  3. Búsqueda (3 queries)

#### 3.1 `buscarArquitectos`
Búsqueda de arquitectos con filtros.

**Entrada:**
- `especialidad: String` (opcional)
- `aniosExperienciaMin: Int` (opcional)
- `cedula: String` (opcional)

**Retorna:** `[PerfilCompletoArquitecto!]!`

**Ejemplo:**
```graphql
query {
  buscarArquitectos(especialidad: "residencial", aniosExperienciaMin: 5) {
    arquitecto {
      id
      cedula_profesional
      especialidad
      anios_experiencia
      usuario {
        nombre
        apellido
        email
      }
    }
    proyectos {
      id
      titulo
      estado_proyecto
    }
  }
}
```

---

#### 3.2 `buscarProyectos`
Búsqueda de proyectos con filtros.

**Entrada:**
- `estado: String` (opcional)
- `arquitectoId: ID` (opcional)
- `clienteId: ID` (opcional)
- `presupuestoMin: Float` (opcional)
- `presupuestoMax: Float` (opcional)

**Retorna:** `[DashboardProyecto!]!`

**Ejemplo:**
```graphql
query {
  buscarProyectos(estado: "en_progreso", presupuestoMin: 100000) {
    proyecto {
      id
      titulo
      presupuesto
      estado_proyecto
      arquitecto {
        usuario {
          nombre
        }
      }
    }
    avances {
      porcentaje_avance
    }
  }
}
```

---

#### 3.3 `buscarConversaciones`
Búsqueda de conversaciones con filtros.

**Entrada:**
- `clienteId: ID` (opcional)
- `arquitectoId: ID` (opcional)

**Retorna:** `[HistorialConversacion!]!`

**Ejemplo:**
```graphql
query {
  buscarConversaciones(clienteId: "123") {
    conversacion {
      id
      titulo
      fecha
      arquitecto {
        usuario {
          nombre
        }
      }
    }
    mensajes {
      contenido
      fecha_envio
    }
  }
}
```

---

## [DIR]  Estructura del Proyecto

```
backend/graphql/
├── main.py                          # Punto de entrada del servidor
├── requirements.txt                 # Dependencias Python
├── .env                             # Variables de entorno
│
├── adapters/
│   └── schemas/                     # Tipos GraphQL base (15 esquemas)
│       ├── usuario_schema.py
│       ├── arquitecto_schema.py
│       ├── cliente_schema.py
│       ├── proyecto_schema.py
│       ├── conversacion_schema.py
│       ├── mensaje_schema.py
│       ├── avance_schema.py
│       ├── valoracion_schema.py
│       ├── incidencia_schema.py
│       └── ... (6 más)
│
├── graphql_types/                   # Tipos complejos personalizados
│   ├── perfil_completo_arquitecto.py
│   ├── dashboard_proyecto.py
│   ├── historial_conversacion.py
│   ├── estadisticas_arquitecto.py
│   ├── kpis_plataforma.py
│   └── metricas_proyecto.py
│
├── queries/                         # Resolvers organizados por categoría
│   ├── agregacion/
│   │   ├── perfil_completo_arquitecto.py
│   │   ├── dashboard_proyecto.py
│   │   └── historial_conversacion.py
│   │
│   ├── metricas/
│   │   ├── estadisticas_arquitecto.py
│   │   ├── kpis_plataforma.py
│   │   └── metricas_proyecto.py
│   │
│   └── busqueda/
│       ├── buscar_arquitectos.py
│       ├── buscar_proyectos.py
│       └── buscar_conversaciones.py
│
└── infrastructure/
    └── rest_client.py               # Cliente HTTP para consumir Rails API
```

### Separación de Responsabilidades

| Componente | Responsabilidad |
|------------|-----------------|
| `adapters/schemas/` | Tipos base que mapean 1:1 con modelos de Rails |
| `graphql_types/` | Tipos complejos que combinan múltiples recursos |
| `queries/agregacion/` | Consultas que combinan datos de varios endpoints |
| `queries/metricas/` | Consultas que calculan estadísticas y KPIs |
| `queries/busqueda/` | Consultas con filtros y búsquedas complejas |
| `infrastructure/` | Capa de comunicación con la API REST |

---

## [SUCCESS]  Ventajas sobre REST

| Escenario | REST | GraphQL |
|-----------|------|---------|
| **Perfil de arquitecto** | 3+ peticiones | 1 query |
| **Dashboard proyecto** | 7+ peticiones | 1 query |
| **KPIs plataforma** | 5+ peticiones | 1 query |
| **Overfetching** | Datos innecesarios | Solo campos solicitados |
| **Underfetching** | Múltiples round-trips | Datos completos en 1 query |
| **Versionado** | `/v1/`, `/v2/` | Evolución del schema |

### Ejemplo Comparativo

**Caso:** Obtener perfil de arquitecto con sus últimos 5 proyectos

**REST (3 peticiones):**
```javascript
// 1. Obtener arquitecto
const arq = await fetch('/api/v1/arquitectos/123')
// 2. Obtener usuario
const user = await fetch(`/api/v1/usuarios/${arq.usuario_id}`)
// 3. Obtener proyectos
const proyectos = await fetch('/api/v1/proyectos?arquitecto_id=123&limit=5')
```

**GraphQL (1 query):**
```javascript
const data = await graphql(`
  query {
    perfilCompletoArquitecto(arquitectoId: "123") {
      arquitecto {
        usuario { nombre apellido email }
      }
      proyectos(limit: 5) { titulo estado_proyecto }
    }
  }
`)
```

---

## [WARN]  Limitaciones

### Este servicio NO maneja:

- [ERROR]  **Autenticación**: Usa la API REST para login/registro
- [ERROR]  **Mutaciones**: Usa REST para crear/actualizar/eliminar recursos
- [ERROR]  **Autorización**: Usa REST para validar permisos
- [ERROR]  **Lógica de negocio**: Rails maneja validaciones y reglas
- [ERROR]  **Persistencia**: Solo consume datos, no modifica la BD

### Flujo recomendado:

1. **Login/Registro** → REST: `POST /api/v1/usuarios/sign_in`
2. **CRUD simple** → REST: `POST /api/v1/proyectos`
3. **Consultas complejas** → GraphQL: `query perfilCompletoArquitecto`
4. **Dashboards** → GraphQL: `query kpisPlataforma`

---

##  Troubleshooting

### Error: `Connection refused to localhost:3000`

**Causa:** La API REST no está corriendo.

**Solución:**
```bash
cd c:\Users\leoan\Desktop\arqui-pro\backend\APIREST
rails server
```

---

### Error: `httpx.ConnectError`

**Causa:** URL base incorrecta en `.env`.

**Solución:**
```env
# Verifica que la URL sea correcta
REST_API_BASE_URL=http://localhost:3000/api/v1
```

---

### Error: `No module named 'strawberry'`

**Causa:** Dependencias no instaladas.

**Solución:**
```bash
pip install -r requirements.txt
```

---

### Error: `AttributeError: 'str' object has no attribute 'isoformat'`

**Causa:** Ya resuelto - todos los campos de fecha son `str` (ISO 8601).

**Verificación:**
```python
# En adapters/schemas/usuario_schema.py
fecha_registro: Optional[str] = None  # [SUCCESS]  Correcto
```

---

### Queries retornan `null`

**Causa:** El ID proporcionado no existe en la BD.

**Solución:**
1. Verifica que Rails tiene datos: `curl http://localhost:3000/api/v1/arquitectos`
2. Usa un ID válido en la query
3. Carga datos de prueba: `rails db:seed`

---

### Error: `Recursion depth exceeded`

**Causa:** Ya resuelto - se removieron todos los `@strawberry.field` de schemas base.

**Verificación:**
```python
# adapters/schemas/usuario_schema.py
# [ERROR]  Antes (causaba recursión)
# @strawberry.field
# def arquitecto(self) -> Optional[ArquitectoType]:
#     return ...

# [SUCCESS]  Ahora (sin field resolvers)
arquitecto_id: Optional[str] = None
```

---

##  Documentación Adicional

### Recursos de Aprendizaje

- [Strawberry GraphQL Docs](https://strawberry.rocks/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [GraphQL Official Docs](https://graphql.org/learn/)
- [httpx Async Client](https://www.python-httpx.org/)
- [Frontend GraphQL Implementation](../frontend/FRONTEND_IMPLEMENTATION.md#graphql-implementation)

### Arquitectura de Referencia

- [GraphQL Gateway Pattern](https://www.apollographql.com/docs/technotes/TN0003-gateway-pattern/)
- [BFF (Backend for Frontend)](https://samnewman.io/patterns/architectural/bff/)

---

## [PROXY]  Integración con Frontend

### Configuración de Apollo Client

**Archivo:** `frontend/src/services/graphql/apolloClient.ts`

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { API_CONFIG, getAuthToken } from '../../config/api.config'

const httpLink = createHttpLink({
  uri: API_CONFIG.GRAPHQL_URL, // http://localhost:8000/graphql
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

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})
```

### Ejemplo con Apollo Client (React)

```javascript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:8000/graphql',
  cache: new InMemoryCache(),
});

// Query
const GET_ARQUITECTO = gql`
  query GetArquitecto($id: ID!) {
    perfilCompletoArquitecto(arquitectoId: $id) {
      arquitecto {
        usuario {
          nombre
          apellido
        }
      }
      proyectos {
        titulo
      }
    }
  }
`;

// Uso
const { data } = await client.query({
  query: GET_ARQUITECTO,
  variables: { id: '123' },
});
```

### Ejemplo con fetch (Vanilla JS)

```javascript
async function getKPIs() {
  const response = await fetch('http://localhost:8000/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query {
          kpisPlataforma {
            total_usuarios
            total_proyectos
          }
        }
      `
    })
  });
  
  const { data } = await response.json();
  return data.kpisPlataforma;
}
```
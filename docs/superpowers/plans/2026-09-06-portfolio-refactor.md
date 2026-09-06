# Plan de Implementación: Refactorización Integral para Portafolio Full Stack

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar el repositorio en un proyecto estrella para portafolio con arquitectura políglota limpia, docker-compose unificado, modularización estricta (< 400 líneas por archivo), cero emojis en código, componentes estandarizados y un historial de commits limpio en la rama `main`.

**Architecture:** Limpieza inicial de archivos huérfanos e infra -> Renombrado y refactorización modular en backend (Rails, NestJS, Python) -> Modularización y estandarización de componentes frontend (React TS, LucideReact, CSS con prefijos) -> Verificación de build y tests -> Documentación técnica senior -> Reescritura semántica del árbol de Git en `main`.

**Tech Stack:** React 18, Vite, TypeScript, Lucide React, NestJS, Socket.IO, TypeORM, Ruby on Rails, PostgreSQL, Python FastAPI, Strawberry GraphQL, LangChain/MCP, RabbitMQ, Docker Compose.

**Spec:** `docs/superpowers/specs/2026-09-06-portfolio-refactor-design.md`

## Global Constraints

- No puede haber emojis en el código generado ni en logs de depuración.
- Los archivos no pueden superar las 400 líneas.
- Iconos exclusivamente con `lucide-react`.
- Props de componentes creados con `type Props` en el mismo archivo.
- Firma de componente: `export default function Component({ ... }: Props) { return (...); }`.
- Evitar el uso de `any`.
- Clases CSS con prefijo único por componente y diseño responsive.
- Cero estilos en línea en JSX/HTML.
- Todos los comentarios de código en español.
- Tipos de dominio en `src/types/` intactos sin autorización previa.
- Verificación obligatoria con `npm run build` y `npm test`.

---

### Task 1: Seguridad Inicial, Limpieza de Artefactos y `.gitignore` Exhaustivo

**Files:**
- Modify: `.gitignore`
- Delete: `package-lock.json`
- Delete: `backend/APIREST/package-lock.json`
- Delete: `backend/graphql/package-lock.json`

**Interfaces:**
- Consumes: Estado actual del repositorio
- Produces: Rama de respaldo `backup-main-before-refactor`, repositorio sin archivos huérfanos y `.gitignore` exhaustivo

- [ ] **Paso 1: Crear rama de respaldo inmutable**
```bash
git branch backup-main-before-refactor
```

- [ ] **Paso 2: Eliminar archivos lockfile huérfanos**
```bash
rm -f package-lock.json backend/APIREST/package-lock.json backend/graphql/package-lock.json
```

- [ ] **Paso 3: Actualizar `.gitignore` con exclusiones completas**
Asegurar que `.gitignore` contenga reglas para Node, Rails, Python, Docker, caches, temporales y variables de entorno.

- [ ] **Paso 4: Verificar estado limpio**
```bash
git status
```

---

### Task 2: Orquestación Docker Consolidada en Raíz

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`

**Interfaces:**
- Consumes: Puertos y servicios de `backend/auth-microservicio`, `backend/gateway`, `backend/websocket`, `backend/APIREST`, `backend/graphql`, `backend/ai-orchestrator`, `frontend`
- Produces: `docker-compose.yml` unificado para evaluar y levantar el proyecto con un solo comando

- [ ] **Paso 1: Crear `.env.example` en la raíz con variables documentadas**
Definir variables para PostgreSQL (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`), RabbitMQ (`RABBITMQ_DEFAULT_USER`, `RABBITMQ_DEFAULT_PASS`), JWT (`JWT_SECRET`), URLs de microservicios y puertos.

- [ ] **Paso 2: Crear `docker-compose.yml` en la raíz**
Configurar servicios:
- `postgres` (puerto 5432)
- `rabbitmq` (puerto 5672 y 15672 para management)
- `auth-microservicio` (puerto 3001)
- `gateway` (puerto 3000)
- `websocket` (puerto 3006)
- `apirest` (puerto 3002)
- `graphql` (puerto 8000)
- `ai-orchestrator` (puerto 8001)
- `frontend` (puerto 5173)

- [ ] **Paso 3: Validar sintaxis de docker-compose**
```bash
docker compose config > /dev/null
```

---

### Task 3: Renombrar y Normalizar Microservicio `websocket`

**Files:**
- Rename: `backend/wedsocket` -> `backend/websocket`
- Modify: `backend/websocket/package.json`
- Modify: `backend/gateway/src/app.module.ts` (si referencia la ruta o URL)
- Modify: `README.md` y `docs/` donde aparezca `wedsocket`

**Interfaces:**
- Consumes: Carpeta existente `backend/wedsocket`
- Produces: `backend/websocket` con nombre correcto y referencias sincronizadas

- [ ] **Paso 1: Renombrar carpeta**
```bash
mv backend/wedsocket backend/websocket
```

- [ ] **Paso 2: Actualizar `package.json` en `backend/websocket`**
Cambiar `"name": "wedsocket"` a `"name": "websocket"`.

- [ ] **Paso 3: Reemplazar todas las apariciones de `wedsocket` en docs y configuraciones**
Actualizar rutas y documentación.

- [ ] **Paso 4: Validar build de TypeScript en websocket**
```bash
cd backend/websocket && npm run build
```

---

### Task 4: Modularización y Limpieza de Logs en `backend/APIREST` (Rails)

**Files:**
- Modify: `backend/APIREST/app/services/websocket_notifier.rb` (< 400 líneas)
- Create: `backend/APIREST/app/services/websocket/base_notifier.rb`
- Create: `backend/APIREST/app/services/websocket/proyecto_notifier.rb`
- Create: `backend/APIREST/app/services/websocket/verificacion_notifier.rb`
- Create: `backend/APIREST/app/services/websocket/incidencia_notifier.rb`

**Interfaces:**
- Consumes: Métodos actuales de `WebsocketNotifier`
- Produces: Estructura modular SRP donde cada archivo tiene < 400 líneas y cero emojis en logs

- [ ] **Paso 1: Crear `app/services/websocket/base_notifier.rb`**
Implementar cliente HTTP base para emisión de eventos Socket.IO/HTTP con manejo de errores limpio sin emojis.

- [ ] **Paso 2: Modularizar notificadores específicos en `app/services/websocket/`**
Separar lógica de proyectos, valoraciones, avances, incidencias y verificaciones en submódulos especializados.

- [ ] **Paso 3: Reducir `websocket_notifier.rb` a fachada delegada**
Asegurar que `websocket_notifier.rb` actúe como interfaz única limpia (< 200 líneas).

- [ ] **Paso 4: Limpiar logs con emojis en controladores y modelos de Rails**
Reemplazar cadenas como `[ERROR]  Error` por mensajes profesionales como `[ERROR] Fallo al notificar evento`.

---

### Task 5: Limpieza y Estandarización en Backend Auth, Gateway, GraphQL y AI Orchestrator

**Files:**
- Modify: `backend/auth-microservicio/` (limpieza de logs y buenas prácticas)
- Modify: `backend/gateway/` (verificación de middleware y enrutamiento)
- Modify: `backend/graphql/` (limpieza de dependencias y logs)
- Modify: `backend/ai-orchestrator/` (limpieza de logs y documentación de herramientas MCP)

**Interfaces:**
- Consumes: Servicios actuales
- Produces: Microservicios limpios, sin emojis en logs, con comentarios en español y manejo de errores profesional

- [ ] **Paso 1: Auditar y limpiar emojis en `backend/auth-microservicio` y `backend/gateway`**
- [ ] **Paso 2: Auditar y limpiar emojis en `backend/graphql` y `backend/ai-orchestrator`**
- [ ] **Paso 3: Validar compilación en servicios Node**
```bash
cd backend/auth-microservicio && npm run build
cd ../gateway && npm run build
```

---

### Task 6: Modularización de Archivos Frontend que Superan 400 Líneas

**Files:**
- Modify: `frontend/src/pages/Arquitecto/ArchitectProjectDetail.tsx`
- Create: `frontend/src/pages/Arquitecto/components/project-detail/ProjectOverviewTab.tsx`
- Create: `frontend/src/pages/Arquitecto/components/project-detail/ProjectAvancesTab.tsx`
- Create: `frontend/src/pages/Arquitecto/components/project-detail/ProjectMilestoneModal.tsx`
- Modify: `frontend/src/pages/Arquitecto/ArquitectoProfile.tsx`
- Create: `frontend/src/pages/Arquitecto/components/profile/ArchitectBioSection.tsx`
- Create: `frontend/src/pages/Arquitecto/components/profile/ArchitectProjectsGrid.tsx`
- Create: `frontend/src/pages/Arquitecto/components/profile/ArchitectStatsCard.tsx`
- Modify: `frontend/src/components/auth/FormularioRegistroArquitecto.tsx`
- Create: `frontend/src/components/auth/steps/RegistroArquitectoPaso1.tsx`
- Create: `frontend/src/components/auth/steps/RegistroArquitectoPaso2.tsx`
- Modify: `frontend/src/pages/Moderator/Incidencias.tsx`
- Create: `frontend/src/pages/Moderator/components/IncidenciasTable.tsx`
- Create: `frontend/src/pages/Moderator/components/IncidenciaDetailModal.tsx`

**Interfaces:**
- Consumes: Componentes monolíticos actuales
- Produces: Componentes modulares con < 400 líneas cada uno, respetando contratos de props y estado

- [ ] **Paso 1: Modularizar `ArchitectProjectDetail.tsx`**
Extraer tabs y modales. Reducir el archivo principal de 659 líneas a menos de 300 líneas.

- [ ] **Paso 2: Modularizar `ArquitectoProfile.tsx`**
Extraer secciones de biografía, proyectos destacados y estadísticas. Reducir el archivo de 652 líneas a menos de 300 líneas.

- [ ] **Paso 3: Modularizar `FormularioRegistroArquitecto.tsx`**
Extraer subcomponentes de pasos. Reducir de 459 líneas a menos de 250 líneas.

- [ ] **Paso 4: Modularizar `Incidencias.tsx`**
Extraer tabla y modal de detalle. Reducir de 438 líneas a menos de 250 líneas.

- [ ] **Paso 5: Validar que ningún archivo en frontend supere 400 líneas**
```bash
find frontend/src -name "*.tsx" -o -name "*.ts" | xargs wc -l | awk '$1 > 400 {print $0}'
```
Salida esperada: vacío (0 archivos superan 400 líneas).

---

### Task 7: Estandarización de Componentes Frontend, Tipos, Iconos y Estilos

**Files:**
- Modify: Componentes en `frontend/src/components/` y `frontend/src/pages/`
- Modify: Estilos en `frontend/src/styles/`

**Interfaces:**
- Consumes: Componentes React existentes
- Produces: Componentes con firma estándar `export default function Component({ ... }: Props)`, `type Props`, LucideReact para iconos, sin emojis y estilos responsive

- [ ] **Paso 1: Estandarizar firmas de componentes y tipos `Props`**
Reemplazar funciones flecha anónimas o firmas sin `Props` por:
```tsx
type Props = {
  // definiciones
};

export default function ComponentName({ ... }: Props) {
  return ( ... );
}
```

- [ ] **Paso 2: Depuración de Emojis en Frontend**
Buscar y reemplazar cualquier emoji en JSX por su icono correspondiente de `lucide-react`. Reemplazar o eliminar logs con emojis en hooks y servicios.

- [ ] **Paso 3: Normalización de Prefijos de Estilos y Responsive Design**
Verificar que cada módulo CSS tenga prefijos coherentes y media queries para pantallas móviles.

- [ ] **Paso 4: Verificación estricta de no modificación de Types de dominio**
Validar que los archivos en `frontend/src/types/` permanezcan inalterados.

---

### Task 8: Verificación Integral de Compilación y Pruebas

**Files:**
- N/A (Verificación transversal)

**Interfaces:**
- Consumes: Todo el código refactorizado
- Produces: Certificación de compilación limpia y pruebas pasando

- [ ] **Paso 1: Ejecutar build del frontend**
```bash
cd frontend && npm run build
```
Salida esperada: Build exitoso sin errores de TypeScript ni empaquetado Vite.

- [ ] **Paso 2: Ejecutar tests del frontend**
```bash
cd frontend && npm test
```

- [ ] **Paso 3: Validar microservicio websocket**
```bash
cd backend/websocket && npm run build && npm test
```

---

### Task 9: Documentación de Alto Impacto para Portafolio

**Files:**
- Modify: `README.md` (en la raíz)
- Review: `docs/`

**Interfaces:**
- Consumes: Arquitectura completa del proyecto
- Produces: `README.md` principal que destaque el proyecto para recruiters y tech leads

- [ ] **Paso 1: Rediseñar `README.md` de la raíz**
Incluir:
1. Título y descripción atractiva para portafolio.
2. Badges de tecnologías y arquitectura.
3. Diagrama de arquitectura en Mermaid (Frontend -> Gateway -> Microservicios -> RabbitMQ / WebSockets / AI MCP).
4. Principios y patrones aplicados (Microservicios, Hexagonal/Clean Architecture, SOLID, Event-Driven, Políglota).
5. Guía de instalación y despliegue rápido con Docker en 1 paso (`docker compose up -d`).
6. Guía de credenciales y cuentas de prueba.

---

### Task 10: Reescritura del Historial de Git en `main` con Conventional Commits

**Files:**
- Git repository history on branch `main`

**Interfaces:**
- Consumes: Código refactorizado y validado en todas las capas
- Produces: Historial atómico, limpio y profesional en la rama `main`

- [ ] **Paso 1: Crear una rama temporal limpia a partir de la raíz o reestructurar commits atómicos**
Generar la secuencia ordenada de commits semánticos:
1. `chore(repo): configurar .gitignore exhaustivo y depurar artefactos residuales`
2. `chore(infra): consolidar orquestacion docker compose y variables de entorno`
3. `refactor(websocket): renombrar microservicio y corregir referencias transversales`
4. `refactor(apirest): modularizar notificador websocket y estandarizar logs en rails`
5. `refactor(auth-gateway): optimizar dtos, seguridad y comunicacion con rabbitmq`
6. `refactor(ai-graphql): estructurar servidor mcp, queries graphql y logs en python`
7. `refactor(frontend-core): modularizar vistas extensas y aplicar firma estandar de componentes`
8. `refactor(frontend-styles): organizar prefijos unicos de estilos y adaptabilidad responsive`
9. `test(verification): asegurar suites de pruebas y verificacion de builds`
10. `docs(portfolio): estructurar documentacion de arquitectura poliglota y guia de inicio`

- [ ] **Paso 2: Apuntar `main` a la secuencia limpia**
- [ ] **Paso 3: Verificar historial final con `git log --oneline -n 15`**
- [ ] **Paso 4: Confirmar que la rama de respaldo `backup-main-before-refactor` permanece disponible**

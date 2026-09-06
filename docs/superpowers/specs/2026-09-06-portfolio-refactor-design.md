# Especificación de Diseño: Refactorización Integral para Portafolio Full Stack

**Fecha:** 2026-09-06  
**Estado:** Aprobado en Brainstorming  
**Objetivo:** Transformar el repositorio en un proyecto estrella de portafolio Full Stack con arquitectura limpia, código profesional, orquestación Docker simplificada, documentación de alto impacto y un historial de commits semánticos y estructurados en la rama `main`.

---

## 1. Alcance y Objetivos

El proyecto actual cuenta con una arquitectura políglota avanzada (React + Vite, NestJS, Ruby on Rails, Python FastAPI/GraphQL, RabbitMQ, Socket.IO, n8n y MCP). Sin embargo, presenta deuda técnica a nivel de repositorio e historial:
1. Historial de Git desordenado (162 commits con merges y mensajes poco claros).
2. Archivos huérfanos (`package-lock.json` en raíz, en Rails y en GraphQL sin `package.json`).
3. Nombre de carpeta con error tipográfico (`backend/wedsocket` en lugar de `backend/websocket`).
4. Archivos de frontend y backend que superan el límite de 400 líneas establecido por las reglas del proyecto.
5. Inconsistencias en firmas de componentes React, declaración de `type Props` y presencia de emojis en logs/código.
6. Falta de una orquestación centralizada en Docker Compose para levantar el stack completo de forma sencilla.

---

## 2. Decisiones Arquitectónicas y Estándares

### 2.1 Infraestructura y Limpieza
- **Respaldo de Seguridad:** Crear la rama local `backup-main-before-refactor` antes de cualquier modificación en el árbol de Git.
- **Limpieza de Archivos Huérfanos:**
  - Eliminar `/package-lock.json` en la raíz.
  - Eliminar `/backend/APIREST/package-lock.json`.
  - Eliminar `/backend/graphql/package-lock.json`.
- **`.gitignore` Exhaustivo:**
  - Configurar exclusiones universales para Node, Python, Ruby on Rails, Docker, claves/secretos y logs.
- **Orquestación Docker:**
  - Consolidar `/docker-compose.yml` en la raíz con configuración para PostgreSQL, RabbitMQ, Auth, Gateway, WebSocket, Rails API REST, GraphQL y AI Orchestrator.
  - Sincronizar y documentar variables en `.env.example`.

### 2.2 Reestructuración de Microservicios Backend
- **Renombrado:** `backend/wedsocket` -> `backend/websocket`.
- **Actualización de Referencias:** Modificar imports, rutas del Gateway, configs y tests que apunten a la ruta anterior.
- **Modularización Rails (Principio de Responsabilidad Única):**
  - Refactorizar `backend/APIREST/app/services/websocket_notifier.rb` (480 líneas) extrayendo la lógica HTTP y subdividiendo en notificadores específicos bajo `app/services/websocket/` (`base_notifier.rb`, `proyecto_notifier.rb`, etc.) manteniendo la fachada para retrocompatibilidad y asegurando que ningún archivo supere las 400 líneas.
- **Depuración de Logs:** Remover todos los emojis de los mensajes de log en Rails, NestJS y Python.

### 2.3 Refactorización Exhaustiva del Frontend (React + TypeScript)
- **Modularización de Archivos > 400 Líneas:**
  - `frontend/src/pages/Arquitecto/ArchitectProjectDetail.tsx` (659 líneas) -> Extraer subcomponentes de pestañas, avances y modales.
  - `frontend/src/pages/Arquitecto/ArquitectoProfile.tsx` (652 líneas) -> Extraer secciones biográficas, portafolio y métricas.
  - `frontend/src/components/auth/FormularioRegistroArquitecto.tsx` (459 líneas) -> Modularizar pasos de registro.
  - `frontend/src/pages/Moderator/Incidencias.tsx` (438 líneas) -> Extraer tabla de incidencias y panel de resolución.
- **Estandarización de Componentes:**
  - Todos los componentes deben utilizar la firma:
    ```tsx
    type Props = {
      // propiedades
    };

    export default function ComponentName({ ... }: Props) {
      return ( ... );
    }
    ```
  - Props declarados con `type Props` en el mismo archivo del componente.
- **Iconografía y Buenas Prácticas:**
  - Prohibido el uso de emojis en JSX/HTML y código; usar exclusivamente componentes de `lucide-react`.
  - Reemplazar console.logs con emojis por mensajes limpios en español.
- **Estilos y Responsive:**
  - Clases CSS con prefijo único por componente.
  - Cero estilos en línea en el JSX.
  - Diseños adaptables a pantallas pequeñas.
- **Capa de Dominio (Types):**
  - Los tipos en `src/types/` representan la capa de dominio y se mantienen estrictamente intactos.
  - Evitar el uso de `any`.

### 2.4 Documentación de Portafolio
- `README.md` principal estructurado para evaluadores técnicos:
  - Diagrama de arquitectura de microservicios (Mermaid).
  - Stack tecnológico detallado.
  - Instrucciones de inicio rápido en 1 comando con Docker.
  - Módulos explicados de manera concisa sin redundancia.

### 2.5 Reescritura del Historial de Git en `main`
- Reconstruir una historia limpia y atómica en `main` aplicando Conventional Commits:
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

---

## 3. Plan de Verificación

1. **Compilación de Frontend:**
   - Ejecución de `npm run build` en `frontend/` mediante el entorno node/pnpm.
2. **Pruebas Automatizadas:**
   - Ejecución de `npm test` en `frontend/` y `backend/websocket`.
3. **Validación de Líneas de Código:**
   - Script de verificación (`find ... | xargs wc -l`) para certificar que ningún archivo supera las 400 líneas.
4. **Validación de Emojis:**
   - Búsqueda de expresiones regulares en código fuente para garantizar cero emojis.
5. **Verificación de Git:**
   - Inspección del historial de `main` con `git log --oneline` para validar la secuencia atómica y limpia.

# [METRICS]  Guía de Reportes del Moderador - ArquiPro

## Descripción General

El módulo de **Reportes del Moderador** es una herramienta integral para generar análisis detallados de la plataforma. Los reportes se crean bajo demanda utilizando datos en tiempo real de GraphQL y se pueden descargar en formato HTML.

---

##  Tipos de Reportes Disponibles

### 1. **Reporte de KPIs de la Plataforma**
**Icono:** [METRICS]  (BarChart3)

Muestra indicadores clave de desempeño general de la plataforma:
- **Total de Usuarios**: Cantidad total de usuarios registrados
- **Total de Proyectos**: Cantidad de proyectos activos
- **Usuarios Activos**: Usuarios con actividad reciente
- **Arquitectos Verificados**: Total de arquitectos verificados
- **Reportes Pendientes**: Incidencias pendientes de resolución
- **Tasa de Verificación**: Porcentaje de arquitectos verificados

**Uso ideal:** Revisión rápida del estado general de la plataforma

---

### 2. **Reporte de Arquitectos**
**Icono:** [GROUP]  (Users)

Información detallada de todos los arquitectos registrados:
- **Datos Personales**: Nombre, email, especialidad
- **Estado de Verificación**: Pendiente, Aprobado o Rechazado
- **Proyectos Asociados**: Cantidad de proyectos creados
- **Estadísticas de Desempeño**: Valoraciones promedio, tiempo en plataforma
- **Información de Contacto**: Datos para comunicación

**Uso ideal:** Auditoría de arquitectos, análisis de desempeño, contacto con profesionales

---

### 3. **Reporte de Proyectos**
**Icono:** [DIR]  (FolderKanban)

Información completa sobre todos los proyectos en la plataforma:
- **Detalles de Proyecto**: Nombre, descripción, ubicación
- **Estado**: Activo, Completado, Cancelado
- **Avances**: Porcentaje de avance, hitos alcanzados
- **Incidencias Asociadas**: Problemas reportados y estado
- **Equipo Involucrado**: Arquitecto, cliente, colaboradores
- **Fechas Clave**: Inicio, duración estimada, completación

**Uso ideal:** Seguimiento de proyectos, análisis de incidencias, auditoría de calidad

---

### 4. **Reporte de Incidencias**
**Icono:** [WARN]  (AlertTriangle)

Análisis detallado de todas las incidencias reportadas:
- **Descripción de Incidencia**: Problemas reportados
- **Estado**: Pendiente, En revisión, Resuelto, Rechazado
- **Usuarios Involucrados**: Emisor del reporte e infractor
- **Asignación a Moderador**: Moderador responsable
- **Fechas**: Creación, resolución
- **Tipo de Contenido**: Proyecto, Mensaje, Perfil, Valoración

**Uso ideal:** Investigación de problemas, seguimiento disciplinario, análisis de patrones

---

## [PROXY]  Flujo de Generación de Reportes

```
┌─────────────────────────────────────────────────────────────┐
│                   Página de Reportes                         │
│            (Frontend/Moderator/Reportes.tsx)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
         ┌──────────────────────────────────────┐
         │  Usuario hace clic en "Generar Reporte" │
         └──────────────────────────────────────┘
                            ↓
         ┌──────────────────────────────────────┐
         │  Ejecuta Query GraphQL específica     │
         │  (REPORTE_KPIS, REPORTE_ARQUITECTOS) │
         └──────────────────────────────────────┘
                            ↓
         ┌──────────────────────────────────────┐
         │  Backend devuelve datos en tiempo real │
         │  (servicios/api/moderador/*)         │
         └──────────────────────────────────────┘
                            ↓
         ┌──────────────────────────────────────┐
         │  ReportesService.guardarReporte()     │
         │  - Almacena en memoria               │
         │  - Genera ID único                   │
         │  - Expira en 24 horas                │
         └──────────────────────────────────────┘
                            ↓
         ┌──────────────────────────────────────┐
         │  Generar HTML formateado             │
         │  (generarHTMLReporte)                │
         └──────────────────────────────────────┘
                            ↓
         ┌──────────────────────────────────────┐
         │  Abrir en nueva pestaña              │
         │  (/reports/{reporteId})              │
         └──────────────────────────────────────┘
                            ↓
         ┌──────────────────────────────────────┐
         │  Usuario puede:                      │
         │  [OK]  Ver datos formateados             │
         │  [OK]  Descargar como HTML               │
         │  [OK]  Imprimir                          │
         └──────────────────────────────────────┘
```

---

## [LIST]  Componentes Principales

### **Reportes.tsx** 
**Ubicación:** `frontend/src/pages/Moderator/Reportes.tsx`

El componente principal que gestiona la interfaz de usuario:

```typescript
// Botones disponibles
const botonesReportes: ReporteButton[] = [
  { id: 'kpis', nombre: 'Reporte de KPIs...', query: generarKPIs },
  { id: 'arquitectos', nombre: 'Reporte de Arquitectos...', query: generarArquitectos },
  { id: 'proyectos', nombre: 'Reporte de Proyectos...', query: generarProyectos },
  { id: 'incidencias', nombre: 'Reporte de Incidencias...', query: generarIncidencias }
];
```

**Estados de Botón:**
- ️ **Generando**: Muestra spinner mientras se procesa
- [SUCCESS]  **Generado**: Indicador de éxito por 3 segundos
-  **Inactivo**: Listo para hacer clic

---

### **reportesService.ts**
**Ubicación:** `frontend/src/services/api/reportesService.ts`

Servicio singleton que maneja:

#### Métodos Principales:

```typescript
// 1. Guardar reporte en memoria
guardarReporte(tipo: string, nombre: string, datos: any): string
  → Retorna: ID único del reporte
  → Expira en: 24 horas

// 2. Obtener reporte
obtenerReporte(id: string): ReporteData | null
  → Busca por ID
  → Verifica expiración

// 3. Generar URL para acceso
generarUrlReporte(id: string): string
  → Retorna: /reports/{id}

// 4. Generar HTML formateado
generarHTMLReporte(reporte: ReporteData): string
  → Crea documento HTML completo
  → Incluye estilos CSS integrados
  → Botón de descarga interactivo

// 5. Descargar reporte
descargarReporte(reporte: ReporteData): void
  → Crea archivo Blob
  → Descarga automáticamente
  → Nombre: {nombre}_{fecha}.html
```

---

## [MULTIMODAL]  Estructura HTML del Reporte

Los reportes generados incluyen:

### **Encabezado**
```html
<div class="header">
  <h1>Nombre del Reporte</h1>
  <div class="meta">
    <strong>Tipo:</strong> kpis_plataforma
    <strong>Fecha:</strong> 12/11/2025
  </div>
</div>
```

### **Botón de Descarga**
```html
<button id="download-btn" class="download-btn">
  ⬇️ Guardar Reporte
</button>
```

### **Contenido**
```html
<div class="content">
  <pre id="reporte-data">{JSON de datos formateado}</pre>
</div>
```

### **Estilos Integrados**
- Diseño responsivo (max-width: 1200px)
- Tema claro y profesional
- Tarjetas estadísticas con bordes de color
- Tablas formateadas
- Efectos hover interactivos

---

##  Funcionalidad de Descarga

### **Proceso de Descarga:**

1. **Usuario hace clic** en "Guardar Reporte"
2. **Event listener** captura el clic
3. **JavaScript** obtiene el HTML completo del documento
4. **Blob** se crea con tipo MIME `text/html;charset=utf-8`
5. **URL temporal** se genera con `createObjectURL`
6. **Archivo** se descarga con nombre: `{reporteNombre}_{fecha}.html`
7. **Limpieza** de memoria y URL temporal

### **Código de Descarga:**
```javascript
document.getElementById('download-btn').addEventListener('click', function(e) {
  e.preventDefault();
  const fullHtml = document.documentElement.outerHTML;
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'reporte_2025-11-12.html';
  link.click();
  URL.revokeObjectURL(url); // Liberar memoria
});
```

---

## [CONN]  Integración con GraphQL

### **Queries Utilizadas:**

```graphql
# KPIs de la Plataforma
REPORTE_KPIS_PLATAFORMA {
  totalUsuarios
  totalProyectos
  totalIncidencias
  arquitectosVerificados
  reportesPendientes
  usuariosActivos
  tasaVerificacion
}

# Arquitectos
REPORTE_ARQUITECTOS(limite: 100) {
  arquitectos {
    id, nombre, email, especialidad
    estado_verificacion
    proyectos_count
  }
}

# Proyectos
REPORTE_PROYECTOS {
  proyectos {
    id, nombre, estado, avance
    incidencias_count
    arquitecto, cliente
  }
}

# Incidencias
REPORTE_INCIDENCIAS(limite: 100) {
  incidencias {
    id, descripcion, estado
    usuario_emisor, usuario_infractor
    moderador_asignado
    fecha_creacion
  }
}
```

---

##  Almacenamiento de Reportes

### **Sistema de Memoria:**

```typescript
private reportes: Map<string, ReporteData> = new Map();
```

**Características:**
- [SUCCESS]  Almacenamiento en cliente (no requiere servidor)
- [SUCCESS]  Expiración automática (24 horas)
- [SUCCESS]  Limpieza automática de reportes viejos
- [WARN]  Se pierden al refrescar la página
- [WARN]  Limitado por memoria del navegador

### **Estructura de ReporteData:**
```typescript
interface ReporteData {
  id: string                    // ID único
  tipo: string                  // kpis_plataforma, arquitectos, etc.
  nombre: string               // Nombre del reporte
  datos: any                    // Datos del GraphQL
  fechaGeneracion: string       // ISO 8601 timestamp
}
```

---

## [NET]  Ruta de Visualización

### **ReporteViewer.tsx**
**Ubicación:** `frontend/src/pages/Moderator/ReporteViewer.tsx`

Esta ruta maneja:
- Parámetro URL: `/reports/{reporteId}`
- Obtiene HTML del `sessionStorage`
- Renderiza el reporte completo
- Permite descarga e impresión

```typescript
// Acceso desde Reportes.tsx
window.open(reporteUrl, '_blank', 'width=1200,height=800');
// Abre en nueva pestaña
```

---

## [START]  Flujo de Uso Paso a Paso

### **1. Acceder a Reportes**
```
Dashboard → Menú Lateral → Reportes
```

### **2. Seleccionar Tipo de Reporte**
```
Ver 4 tarjetas con opciones:
- KPIs de la Plataforma
- Arquitectos
- Proyectos
- Incidencias
```

### **3. Generar Reporte**
```
Click en "Generar Reporte" → Sistema carga datos de GraphQL
```

### **4. Esperar Procesamiento**
```
Botón muestra "Generando..." con spinner
```

### **5. Abrir Reporte**
```
Nueva pestaña abre automáticamente con el reporte
```

### **6. Visualizar o Descargar**
```
Opción 1: Ver en navegador con estilos aplicados
Opción 2: Click en "Guardar Reporte" → Descarga HTML
Opción 3: Imprimir (Ctrl+P) → Guardar como PDF
```

---

## ️ Configuración y Personalización

### **Cambiar Tiempo de Expiración:**
```typescript
// En reportesService.ts, línea 14
private readonly REPORTE_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 horas
// Cambiar a (p. ej., 48 horas):
// private readonly REPORTE_EXPIRATION_TIME = 48 * 60 * 60 * 1000;
```

### **Modificar Estilos del Reporte:**
```typescript
// En generarHTMLReporte(), dentro de <style>
// Editar colores, tamaños, fuentes
// Secciones:
// - body: Fondo general
// - container: Contenedor principal
// - header: Encabezado
// - download-btn: Botón de descarga
// - stats: Tarjetas de estadísticas
// - table: Tablas de datos
```

### **Agregar Nuevo Tipo de Reporte:**
```typescript
// 1. En Reportes.tsx, agregar nueva query
const [generarNuevo] = useLazyQuery(REPORTE_NUEVO);

// 2. Agregar botón
botonesReportes.push({
  id: 'nuevo',
  nombre: 'Reporte Nuevo',
  descripcion: '...',
  icono: IconoNuevo,
  query: generarNuevo,
  tipo: 'nuevo_tipo'
});
```

---

##  Solución de Problemas

### **Problema: "Error al descargar el reporte"**
**Solución:**
- Verificar que `id="download-btn"` esté presente en el HTML
- Comprobar que JavaScript está habilitado
- Revisar permisos de descarga en navegador

### **Problema: Reportes desaparecen tras actualizar**
**Solución:**
- Los reportes se almacenan en memoria del navegador
- Usar `sessionStorage` para persistencia en la sesión
- Considerar implementar backend para reportes persistentes

### **Problema: Datos incompletos en reporte**
**Solución:**
- Verificar que GraphQL devuelva datos correctos
- Revisar límites de paginación en queries
- Aumentar tiempo de espera en lazy queries

### **Problema: Reporte tarda mucho en cargar**
**Solución:**
- Reducir volumen de datos (limitar resultados)
- Optimizar queries GraphQL
- Considerar lazy loading de datos grandes

---

## [METRICS]  Ejemplos de Salida

### **Reporte de KPIs:**
```json
{
  "id": "reporte-1705077600000-abc123",
  "tipo": "kpis_plataforma",
  "nombre": "Reporte de KPIs de la Plataforma",
  "fechaGeneracion": "2025-11-12T10:30:00Z",
  "datos": {
    "totalUsuarios": 450,
    "totalProyectos": 82,
    "totalIncidencias": 12,
    "arquitectosVerificados": 38,
    "reportesPendientes": 3,
    "usuariosActivos": 156,
    "tasaVerificacion": 84.4
  }
}
```

### **Nombre de Archivo Descargado:**
```
Reporte_de_KPIs_de_la_Plataforma_2025-11-12.html
```

---

##  Consideraciones de Seguridad

[SUCCESS]  **Implementado:**
- Datos se procesan en cliente
- IDs de reporte son únicos y aleatorios
- Expiración automática de reportes

[WARN]  **Considerar para futuro:**
- Autenticación obligatoria
- Auditoría de reportes descargados
- Cifrado de datos sensibles
- Rate limiting en generación

---

##  Casos de Uso Reales

1. **Auditoría Mensual**: Ejecutar todos los reportes para auditoría completa
2. **Seguimiento de Incidencias**: Generar reporte de incidencias para análisis
3. **Verificación de Arquitectos**: Monitorear estado de verificaciones pendientes
4. **Análisis de Proyectos**: Identificar proyectos con problemas
5. **Reportes a Gerencia**: Exportar KPIs para presentaciones

---

##  Soporte Técnico

**Archivos Relacionados:**
- `frontend/src/pages/Moderator/Reportes.tsx` - UI principal
- `frontend/src/services/api/reportesService.ts` - Lógica de reportes
- `frontend/src/pages/Moderator/ReporteViewer.tsx` - Visualización
- `frontend/src/services/graphql/queries` - Queries GraphQL
- `frontend/src/styles/Moderator/Reportes.css` - Estilos

**Contacto:**
Para reportar problemas o sugerir mejoras, crear issue en el repositorio.

---

**Última actualización:** 12 de Noviembre de 2025  
**Versión:** 1.0

/**
 * Constantes de la aplicación
 * Centraliza valores hardcodeados para facilitar mantenimiento
 */

// Especialidades de arquitectos
export const ESPECIALIDADES = [
  { value: '', label: 'Especialidad' },
  { value: 'Diseño Urbano', label: 'Diseño Urbano' },
  { value: 'Arquitectura Sostenible', label: 'Arquitectura Sostenible'},
  { value: 'Comercial', label: 'Comercial' },
  { value: 'Paisajismo y Urbanismo', label: 'Paisajismo y Urbanismo' },
  { value: 'Residencial', label: 'Residencial'},
  { value: 'Restauración Patrimonial', label: 'Restauración Patrimonial' },
  { value: 'Conservación', label: 'Conservación' },
  { value: 'Arquitectura Bioclimática', label: 'Arquitectura Bioclimática' }
] as const

// Ratings disponibles para filtro
export const RATINGS = [
  { value: '', label: 'Calificaciones' },
  { value: '5', label: '5 ⭐⭐⭐⭐⭐' },
  { value: '4', label: '4+ ⭐⭐⭐⭐' },
  { value: '3', label: '3+ ⭐⭐⭐' },
  { value: '2', label: '2+ ⭐⭐' },
  { value: '1', label: '1+ ⭐' },
  { value: '0', label: 'Todas las calificaciones' },
] as const

// Estados de verificaciones
export const VERIFICACION_ESTADOS = {
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado',
} as const

export const VERIFICACION_ESTADOS_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: VERIFICACION_ESTADOS.PENDIENTE, label: 'Pendiente' },
  { value: VERIFICACION_ESTADOS.APROBADO, label: 'Aprobado' },
  { value: VERIFICACION_ESTADOS.RECHAZADO, label: 'Rechazado' },
] as const

// Estados de incidencias
export const INCIDENCIA_ESTADOS = {
  PENDIENTE: 'pendiente',
  EN_REVISION: 'en_revision',
  RESUELTO: 'resuelto',
  RECHAZADO: 'rechazado',
} as const

export const INCIDENCIA_ESTADOS_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: INCIDENCIA_ESTADOS.PENDIENTE, label: 'Pendiente' },
  { value: INCIDENCIA_ESTADOS.EN_REVISION, label: 'En Revisión' },
  { value: INCIDENCIA_ESTADOS.RESUELTO, label: 'Resuelto' },
  { value: INCIDENCIA_ESTADOS.RECHAZADO, label: 'Rechazado' },
] as const

// Labels de estados para display
export const INCIDENCIA_ESTADO_LABELS: Record<string, string> = {
  [INCIDENCIA_ESTADOS.PENDIENTE]: 'Pendiente',
  [INCIDENCIA_ESTADOS.EN_REVISION]: 'En Revisión',
  [INCIDENCIA_ESTADOS.RESUELTO]: 'Resuelto',
  [INCIDENCIA_ESTADOS.RECHAZADO]: 'Rechazado',
}

// Colores de badges según estado
export const BADGE_COLORS = {
  PENDIENTE: 'warning',
  APROBADO: 'success',
  EN_REVISION: 'info',
  RESUELTO: 'success',
  RECHAZADO: 'danger',
  DEFAULT: 'default',
} as const

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  ARQUITECTOS_LIMIT: 15,
} as const

// Configuración de caché
export const CACHE = {
  DURATION: 5 * 60 * 1000, // 5 minutos
  KEYS: {
    ARQUITECTOS: 'arquitectos_graphql_cache',
    MODERATOR_STATS: 'moderator_stats_cache',
  },
} as const

// Colores de avatares
export const AVATAR_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#6C5CE7',
  '#FDA7DF',
  '#F8B500',
  '#95E1D3',
  '#F38181',
] as const

// Roles de usuario
export const USER_ROLES = {
  CLIENTE: 'cliente',
  ARQUITECTO: 'arquitecto',
  MODERADOR: 'moderador',
} as const

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  ARCHITECTS: '/architects',
  ABOUT: '/about',
  LOGIN: '/login',
  REGISTER: '/register',
  REGISTER_CLIENTE: '/registro-cliente',
  CLIENTE: {
    HOME: '/cliente/home',
    PROYECTOS: '/cliente/proyectos',
    MENSAJES: '/cliente/mensajes',
    BUSCAR_ARQUITECTO: '/cliente/buscar-arquitecto',
    SOLICITUD: '/cliente/solicitud',
    PROYECTO: '/cliente/proyecto',
  },
  MODERATOR: {
    DASHBOARD: '/moderador/dashboard',
    VERIFICACIONES: '/moderador/verificaciones',
    INCIDENCIAS: '/moderador/incidencias',
    USUARIOS: '/moderador/usuarios',
    REPORTES: '/moderador/reportes',
  },
} as const

// Configuración de API
export const API_CONFIG = {
  REST_URL: import.meta.env.VITE_REST_API_URL || 'http://localhost:3000',
  GRAPHQL_URL: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8000/graphql',
  WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3006',
} as const

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu internet.',
  SERVER_ERROR: 'Error del servidor. Intenta de nuevo más tarde.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'Recurso no encontrado.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
  GENERIC: 'Ocurrió un error inesperado. Intenta de nuevo.',
} as const

// Límites de texto
export const TEXT_LIMITS = {
  DESCRIPTION_PREVIEW: 60,
  DESCRIPTION_MAX: 500,
  COMMENT_MAX: 200,
} as const

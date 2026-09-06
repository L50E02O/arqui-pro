import type { Usuario } from './usuario.types'

/**
 * Tipos para el módulo de Moderador
 */

export interface Moderador {
  id: string | number
  usuario_id: string | number
  permisos?: string
  fecha_asignacion?: string
  num_incidencias_resueltas?: number
  num_arquitectos_verificados?: number
  usuario?: Usuario
}

export interface Reporte {
  id: number
  reportante_id: number
  reportado_id: number
  tipo_contenido: 'proyecto' | 'mensaje' | 'perfil' | 'valoracion'
  contenido_id: number
  motivo: string
  descripcion: string
  estado: 'pendiente' | 'en_revision' | 'resuelto' | 'rechazado'
  fecha_reporte: string
  fecha_resolucion?: string
  moderador_id?: number
  reportante?: Usuario
  reportado?: Usuario
  moderador?: Moderador
}

export interface ModeratorStats {
  totalUsuarios: number
  totalProyectos: number
  totalIncidencias: number
  arquitectosVerificados: number
  reportesPendientes: number
  usuariosActivos: number
  tasaVerificacion: number
}

export interface NotificacionModerador {
  id: number
  tipo: 'verificacion' | 'incidencia' | 'reporte' | 'sistema'
  mensaje: string
  leida: boolean
  fecha: string
  usuario_id: number
}

export interface AccionModeracion {
  tipo: 'aprobar' | 'rechazar' | 'bloquear' | 'eliminar' | 'advertir'
  motivo: string
  duracion_bloqueo?: number // días
  notas_internas?: string
}

export interface RegistroModeradorAttributesInput {
  
}
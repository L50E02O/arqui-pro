import axiosInstance from '../axiosInstance'
import { logger } from '../../../utils/logger'
import type { 
  Verificacion 
} from '../../../types/verificacion.types'
import type { 
  Incidencia 
} from '../../../types/incidencia.types'
import type { 
  AccionModeracion 
} from '../../../types/moderador.types'

// Base URL para endpoints de moderador (axiosInstance ya incluye /api/v1)
const MODERADOR_BASE_URL = ''

/**
 * Servicio para gestionar operaciones de Moderador
 */
export const moderadorService = {
  // ========================
  // VERIFICACIONES
  // ========================

  /**
   * Obtener lista de verificaciones
   */
  async getVerificaciones(params?: {
    estado?: 'pendiente' | 'aprobada' | 'rechazada'
    page?: number
    per_page?: number
  }): Promise<{ data: Verificacion[]; total: number }> {
    try {
      logger.info('Obteniendo verificaciones', params)
      
      const response = await axiosInstance.get(`${MODERADOR_BASE_URL}/verificaciones`, {
        params: {
          estado: params?.estado,
          page: params?.page || 1,
          per_page: params?.per_page || 10
        }
      })

      return {
        data: response.data.verificaciones || response.data,
        total: response.data.total || response.data.length
      }
    } catch (error) {
      logger.error('Error al obtener verificaciones', error)
      throw error
    }
  },

  /**
   * Aprobar una verificación
   */
  async aprobarVerificacion(
    verificacionId: number,
    data: {
      moderador_id: string
      comentarios?: string
    }
  ): Promise<AccionModeracion> {
    try {
      logger.info('Aprobando verificación', { verificacionId, ...data })
      
      const response = await axiosInstance.post(
        `${MODERADOR_BASE_URL}/verificaciones/${verificacionId}/aprobar`,
        data
      )

      return response.data
    } catch (error) {
      logger.error('Error al aprobar verificación', error)
      throw error
    }
  },

  /**
   * Rechazar una verificación
   */
  async rechazarVerificacion(
    verificacionId: number,
    data: {
      moderador_id: string
      comentarios: string // Obligatorio al rechazar
    }
  ): Promise<AccionModeracion> {
    try {
      logger.info('Rechazando verificación', { verificacionId, ...data })
      
      const response = await axiosInstance.post(
        `${MODERADOR_BASE_URL}/verificaciones/${verificacionId}/rechazar`,
        data
      )

      return response.data
    } catch (error) {
      logger.error('Error al rechazar verificación', error)
      throw error
    }
  },

  // ========================
  // INCIDENCIAS
  // ========================

  /**
   * Obtener lista de incidencias
   */
  async getIncidencias(params?: {
    estado?: 'pendiente' | 'en_revision' | 'resuelta' | 'rechazada'
    page?: number
    per_page?: number
  }): Promise<{ data: Incidencia[]; total: number }> {
    try {
      logger.info('Obteniendo incidencias', params)
      
      const response = await axiosInstance.get(`${MODERADOR_BASE_URL}/incidencias`, {
        params: {
          estado: params?.estado,
          page: params?.page || 1,
          per_page: params?.per_page || 10
        }
      })

      return {
        data: response.data.incidencias || response.data,
        total: response.data.total || response.data.length
      }
    } catch (error) {
      logger.error('Error al obtener incidencias', error)
      throw error
    }
  },

  /**
   * Resolver una incidencia
   */
  async resolverIncidencia(
    incidenciaId: number,
    data: {
      moderador_id: string
      resolucion: string
    }
  ): Promise<AccionModeracion> {
    try {
      logger.info('Resolviendo incidencia', { incidenciaId, ...data })
      
      const response = await axiosInstance.post(
        `${MODERADOR_BASE_URL}/incidencias/${incidenciaId}/resolver`,
        data
      )

      return response.data
    } catch (error) {
      logger.error('Error al resolver incidencia', error)
      throw error
    }
  },

  /**
   * Reabrir una incidencia (cambiar a estado "pendiente")
   */
  async reabrirIncidencia(
    incidenciaId: number,
    data: {
      moderador_id: string
    }
  ): Promise<AccionModeracion> {
    try {
      logger.info('Reabriendo incidencia', { incidenciaId, ...data })
      
      const response = await axiosInstance.post(
        `${MODERADOR_BASE_URL}/incidencias/${incidenciaId}/reabrir`,
        data
      )

      return response.data
    } catch (error) {
      logger.error('Error al reabrir incidencia', error)
      throw error
    }
  },

  /**
   * Rechazar una incidencia
   */
  async rechazarIncidencia(
    incidenciaId: number,
    data: {
      moderador_id: string
      resolucion: string // Razón del rechazo
    }
  ): Promise<AccionModeracion> {
    try {
      logger.info('Rechazando incidencia', { incidenciaId, ...data })
      
      const response = await axiosInstance.post(
        `${MODERADOR_BASE_URL}/incidencias/${incidenciaId}/rechazar`,
        data
      )

      return response.data
    } catch (error) {
      logger.error('Error al rechazar incidencia', error)
      throw error
    }
  },

  // ========================
  // USUARIOS
  // ========================

  /**
   * Obtener lista de usuarios
   */
  async getUsuarios(params?: {
    rol?: 'cliente' | 'arquitecto' | 'moderador'
    estado_cuenta?: 'activo' | 'suspendido'
    search?: string
    page?: number
    per_page?: number
  }): Promise<{ data: any[]; total: number }> {
    try {
      logger.info('Obteniendo usuarios', params)
      
      const response = await axiosInstance.get(`${MODERADOR_BASE_URL}/usuarios`, {
        params: {
          rol: params?.rol,
          estado_cuenta: params?.estado_cuenta,
          search: params?.search,
          page: params?.page || 1,
          per_page: params?.per_page || 10
        }
      })

      return {
        data: response.data.usuarios || response.data,
        total: response.data.total || response.data.length
      }
    } catch (error) {
      logger.error('Error al obtener usuarios', error)
      throw error
    }
  },

  /**
   * Suspender un usuario
   */
  async suspenderUsuario(
    usuarioId: string | number,
    data?: {
      moderador_id?: number
      razon?: string
    }
  ): Promise<any> {
    try {
      logger.info('Suspendiendo usuario', { usuarioId, ...data })
      
      const response = await axiosInstance.post(
        `/usuarios/${usuarioId}/suspender`
      )

      return response.data
    } catch (error) {
      logger.error('Error al suspender usuario', error)
      throw error
    }
  },

  /**
   * Activar un usuario suspendido
   */
  async activarUsuario(
    usuarioId: string | number,
    data?: {
      moderador_id?: number
    }
  ): Promise<any> {
    try {
      logger.info('Activando usuario', { usuarioId, ...data })
      
      const response = await axiosInstance.post(
        `/usuarios/${usuarioId}/activar`
      )

      return response.data
    } catch (error) {
      logger.error('Error al activar usuario', error)
      throw error
    }
  },

  // ========================
  // ESTADÍSTICAS
  // ========================

  /**
   * Obtener estadísticas del dashboard
   */
  async getEstadisticas(): Promise<any> {
    try {
      logger.info('Obteniendo estadísticas del moderador')
      
      const response = await axiosInstance.get(`${MODERADOR_BASE_URL}/moderadores/estadisticas`)

      return response.data
    } catch (error) {
      logger.error('Error al obtener estadísticas', error)
      throw error
    }
  }
}

export default moderadorService

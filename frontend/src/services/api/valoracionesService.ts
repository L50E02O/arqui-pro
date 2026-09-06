import axiosInstance, { axiosPublic } from './axiosInstance'
import type { Valoracion } from '../../types/valoracion.types'

const valoracionesService = {
  /**
   * Obtener todas las valoraciones (público, no requiere autenticación)
   */
  getAll: async (): Promise<Valoracion[]> => {
    const response = await axiosPublic.get('/valoraciones')
    return Array.isArray(response.data) ? response.data : []
  },

  /**
   * Obtener valoraciones por proyecto
   */
  getByProyecto: async (proyectoId: string): Promise<Valoracion[]> => {
    const response = await axiosInstance.get('/valoraciones', {
      params: { proyecto_id: proyectoId }
    })
    return Array.isArray(response.data) ? response.data : []
  },

  /**
   * Obtener una valoración por ID
   */
  getById: async (id: string): Promise<Valoracion> => {
    const response = await axiosInstance.get(`/valoraciones/${id}`)
    return response.data
  },

  /**
   * Crear una nueva valoración
   */
  create: async (valoracion: {
    calificacion: number
    comentario: string
    cliente_id: string
    proyecto_id: string
  }): Promise<Valoracion> => {
    const response = await axiosInstance.post('/valoraciones', {
      valoracion
    })
    return response.data
  },

  /**
   * Actualizar una valoración
   */
  update: async (id: string, valoracion: Partial<Valoracion>): Promise<Valoracion> => {
    const response = await axiosInstance.put(`/valoraciones/${id}`, {
      valoracion
    })
    return response.data
  },

  /**
   * Eliminar una valoración
   */
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/valoraciones/${id}`)
  }
}

export default valoracionesService


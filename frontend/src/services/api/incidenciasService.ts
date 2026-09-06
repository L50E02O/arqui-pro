import axiosInstance from './axiosInstance'
import type { Incidencia, CreateIncidenciaDto } from '../../types/incidencia.types'

const incidenciasService = {
  /**
   * Crear una nueva incidencia
   */
  create: async (data: CreateIncidenciaDto): Promise<Incidencia> => {
    const response = await axiosInstance.post('/incidencias', data)
    return response.data
  },

  /**
   * Obtener todas las incidencias
   */
  getAll: async (page: number = 1, per_page: number = 1000, estado?: string) => {
    const params = { page, per_page }
    if (estado) {
      Object.assign(params, { estado })
    }
    const response = await axiosInstance.get('/incidencias', { params })
    // La API devuelve { incidencias: [...], total, page, per_page }
    return response.data.incidencias || []
  },

  /**
   * Obtener una incidencia por ID
   */
  getById: async (id: string): Promise<Incidencia> => {
    const response = await axiosInstance.get(`/incidencias/${id}`)
    return response.data
  },

  /**
   * Actualizar una incidencia
   */
  update: async (id: string, data: Partial<CreateIncidenciaDto>): Promise<Incidencia> => {
    const response = await axiosInstance.put(`/incidencias/${id}`, data)
    return response.data
  },

  /**
   * Eliminar una incidencia
   */
  delete: async (id: string) => {
    await axiosInstance.delete(`/incidencias/${id}`)
  },

  /**
   * Resolver una incidencia
   */
  resolver: async (id: string, moderador_id: string) => {
    const response = await axiosInstance.patch(`/incidencias/${id}/resolver`, { moderador_id })
    return response.data
  },

  /**
   * Reabrir una incidencia
   */
  reabrir: async (id: string, moderador_id: string) => {
    const response = await axiosInstance.patch(`/incidencias/${id}/reabrir`, { moderador_id })
    return response.data
  },
}

export default incidenciasService

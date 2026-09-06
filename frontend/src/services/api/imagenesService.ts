import axiosInstance from './axiosInstance'
import type { CreateImagenDto } from '../../types/imagen.types'

const imagenesService = {
  /**
   * Crear una imagen asociada a una entidad (Incidencia, Proyecto, etc.)
   * @param data - Objeto con imagen_url, fecha y imagen_asociaciones_attributes
   */
  create: async (data: CreateImagenDto) => {
    const response = await axiosInstance.post('/imagenes', { imagen: data })
    return response.data
  },

  /**
   * Obtener todas las imagenes
   */
  getAll: async () => {
    const response = await axiosInstance.get('/imagenes')
    return response.data
  },

  /**
   * Obtener una imagen por ID
   */
  getById: async (id: string) => {
    const response = await axiosInstance.get(`/imagenes/${id}`)
    return response.data
  },

  /**
   * Actualizar una imagen
   */
  update: async (id: string, data: Partial<CreateImagenDto>) => {
    const response = await axiosInstance.put(`/imagenes/${id}`, { imagen: data })
    return response.data
  },

  /**
   * Eliminar una imagen
   */
  delete: async (id: string) => {
    await axiosInstance.delete(`/imagenes/${id}`)
  },
}

export default imagenesService

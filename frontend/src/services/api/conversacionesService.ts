import axiosInstance from './axiosInstance'
import type { Conversacion } from '../../types'

interface CreateConversacionParams {
  cliente_id: string
  arquitecto_id: string
}

interface ConversacionResponse {
  conversacion: Conversacion
  message?: string
  existing?: boolean // Indica si la conversación ya existía
}

const conversacionesService = {
  /**
   * Crear una nueva conversación entre cliente y arquitecto
   */
  async create(params: CreateConversacionParams): Promise<ConversacionResponse> {
    const response = await axiosInstance.post<ConversacionResponse>(
      '/conversaciones',
      {
        conversacion: {
          cliente_id: params.cliente_id, // UUID como string
          arquitecto_id: params.arquitecto_id // UUID como string
          // fecha se maneja automáticamente en el backend
        }
      }
    )
    return response.data
  },

  /**
   * Obtener todas las conversaciones de un usuario
   */
  async getAll(): Promise<Conversacion[]> {
    const response = await axiosInstance.get<Conversacion[]>('/conversaciones')
    return response.data
  },

  /**
   * Obtener una conversación específica por ID
   */
  async getById(id: string): Promise<Conversacion> {
    const response = await axiosInstance.get<Conversacion>(`/conversaciones/${id}`)
    return response.data
  },

  /**
   * Obtener conversación entre cliente y arquitecto específicos
   */
  async getByParticipants(clienteId: string, arquitectoId: string): Promise<Conversacion | null> {
    try {
      const conversaciones = await this.getAll()
      const conversacion = conversaciones.find(
        (c) => 
          String(c.cliente_id) === String(clienteId) && 
          String(c.arquitecto_id) === String(arquitectoId)
      )
      return conversacion || null
    } catch (error) {
      console.error('Error buscando conversación:', error)
      return null
    }
  },

  /**
   * Obtener mensajes de una conversación
   */
  async getMensajes(conversacionId: string) {
    const response = await axiosInstance.get(`/conversaciones/${conversacionId}/mensajes`)
    return response.data
  },

  /**
   * Marcar mensajes como leídos
   */
  async marcarMensajesLeidos(conversacionId: string) {
    const response = await axiosInstance.put(`/conversaciones/${conversacionId}/marcar_mensajes_leidos`)
    return response.data
  },

  /**
   * Eliminar una conversación
   */
  async delete(conversacionId: string): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete(`/conversaciones/${conversacionId}`)
    return response.data
  }
}

export default conversacionesService

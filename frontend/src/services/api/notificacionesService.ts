import axiosInstance from './axiosInstance'

const notificacionesService = {
  /**
   * Marcar una notificación como leída
   */
  async marcarComoLeida(notificacionId: string): Promise<void> {
    await axiosInstance.patch(`/notificaciones/${notificacionId}`, {
      leida: true
    })
  },

  /**
   * Marcar todas las notificaciones de un usuario como leídas
   */
  async marcarTodasLeidas(usuarioId: string): Promise<{ success: boolean; count: number }> {
    const response = await axiosInstance.put('/notificaciones/marcar_todas_leidas', null, {
      params: { usuario_id: usuarioId }
    })
    return response.data
  },

  /**
   * Obtener todas las notificaciones de un usuario
   */
  async getByUsuario(usuarioId: string) {
    const response = await axiosInstance.get('/notificaciones', {
      params: { usuario_id: usuarioId }
    })
    return response.data
  }
}

export default notificacionesService

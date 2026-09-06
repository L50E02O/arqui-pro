import { useCachedData } from './useCachedData'
import axiosInstance from '../services/api/axiosInstance'

/**
 * Hook para obtener proyectos con caché automático
 */
export function useProyectos(filters?: {
  estado?: string
  arquitecto_id?: string
}) {
  return useCachedData({
    cacheKey: 'proyectos_cache',
    fetchFunction: async () => {
      const params = new URLSearchParams()
      if (filters?.estado) params.append('estado', filters.estado)
      if (filters?.arquitecto_id) params.append('arquitecto_id', filters.arquitecto_id)
      
      const response = await axiosInstance.get(`/proyectos?${params.toString()}`)
      return response.data
    },
    duration: 5 * 60 * 1000,
    variables: filters,
    dependencies: [filters]
  })
}

/**
 * Hook para obtener un proyecto específico con caché
 */
export function useProyecto(id?: string) {
  return useCachedData({
    cacheKey: `proyecto_${id}_cache`,
    fetchFunction: async () => {
      if (!id) throw new Error('ID requerido')
      const response = await axiosInstance.get(`/proyectos/${id}`)
      return response.data
    },
    duration: 5 * 60 * 1000,
    dependencies: [id]
  })
}

/**
 * Hook para obtener valoraciones con caché
 */
export function useValoraciones(proyecto_id?: string) {
  return useCachedData({
    cacheKey: `valoraciones_${proyecto_id}_cache`,
    fetchFunction: async () => {
      if (!proyecto_id) throw new Error('Proyecto ID requerido')
      const response = await axiosInstance.get(`/proyectos/${proyecto_id}/valoraciones`)
      return response.data
    },
    duration: 3 * 60 * 1000, // 3 minutos (más frecuente)
    dependencies: [proyecto_id]
  })
}

/**
 * Hook para obtener notificaciones con caché
 */
export function useNotificaciones(usuario_id?: string) {
  return useCachedData({
    cacheKey: `notificaciones_${usuario_id}_cache`,
    fetchFunction: async () => {
      if (!usuario_id) throw new Error('Usuario ID requerido')
      const response = await axiosInstance.get(`/usuarios/${usuario_id}/notificaciones`)
      return response.data
    },
    duration: 1 * 60 * 1000, // 1 minuto (muy frecuente)
    dependencies: [usuario_id]
  })
}

/**
 * Hook para obtener conversaciones con caché
 */
export function useConversaciones(usuario_id?: string) {
  return useCachedData({
    cacheKey: `conversaciones_${usuario_id}_cache`,
    fetchFunction: async () => {
      if (!usuario_id) throw new Error('Usuario ID requerido')
      const response = await axiosInstance.get(`/conversaciones?usuario_id=${usuario_id}`)
      return response.data
    },
    duration: 2 * 60 * 1000, // 2 minutos
    dependencies: [usuario_id]
  })
}

/**
 * Hook para obtener mensajes de una conversación con caché
 */
export function useMensajes(conversacion_id?: string) {
  return useCachedData({
    cacheKey: `mensajes_${conversacion_id}_cache`,
    fetchFunction: async () => {
      if (!conversacion_id) throw new Error('Conversación ID requerido')
      console.log(`🔍 Fetching mensajes para conversación: ${conversacion_id}`)
      const response = await axiosInstance.get(`/conversaciones/${conversacion_id}/mensajes`)
      console.log(`✅ Mensajes recibidos:`, response.data.length, 'para conversación:', conversacion_id)
      return response.data
    },
    duration: 5 * 1000, // 5 segundos (cache muy corto para evitar datos incorrectos)
    dependencies: [conversacion_id]
  })
}

/**
 * Hook para obtener perfil de usuario con caché
 */
export function useUsuarioPerfil(usuario_id?: string) {
  return useCachedData({
    cacheKey: `usuario_perfil_${usuario_id}_cache`,
    fetchFunction: async () => {
      if (!usuario_id) throw new Error('Usuario ID requerido')
      const response = await axiosInstance.get(`/usuarios/${usuario_id}`)
      return response.data
    },
    duration: 10 * 60 * 1000, // 10 minutos (datos que cambian poco)
    dependencies: [usuario_id]
  })
}

/**
 * Hook para obtener estadísticas del dashboard con caché
 */
export function useEstadisticas(arquitecto_id?: string) {
  return useCachedData({
    cacheKey: `estadisticas_${arquitecto_id}_cache`,
    fetchFunction: async () => {
      if (!arquitecto_id) throw new Error('Arquitecto ID requerido')
      const response = await axiosInstance.get(`/arquitectos/${arquitecto_id}/estadisticas`)
      return response.data
    },
    duration: 5 * 60 * 1000,
    dependencies: [arquitecto_id]
  })
}

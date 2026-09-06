import type { Verificacion, UpdateVerificacionDto, CrateVerificacionDto } from "../../types/verificacion.types";
import axiosInstance from "./axiosInstance";
import { CacheService } from '../../utils/cacheService'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

class VerificacionService {
  async getAll(filters?: { estado?: string; arquitecto_id?: string; page?: number; per_page?: number }): Promise<Verificacion[]> {
    // Intentar obtener del caché
    const cacheKey = 'verificaciones_all_cache'
    const cached = CacheService.get<Verificacion[]>(cacheKey, filters, CACHE_DURATION)
    if (cached) {
      console.log('📦 Usando verificaciones desde caché')
      return cached
    }

    const params = new URLSearchParams()
    if (filters?.estado) params.append('estado', filters.estado)
    if (filters?.arquitecto_id) params.append('arquitecto_id', filters.arquitecto_id)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.per_page) params.append('per_page', String(filters.per_page))

    console.log('🌐 Obteniendo verificaciones desde API REST')
    const response = await axiosInstance.get(`/verificaciones${params.toString() ? `?${params.toString()}` : ''}`)

    // Extraer lista: la API puede devolver un array o un objeto { verificaciones: [...] }
    let result: Verificacion[] = []
    if (Array.isArray(response.data)) {
      result = response.data
    } else if (response.data && Array.isArray(response.data.verificaciones)) {
      result = response.data.verificaciones
    } else {
      // Si no viene en el formato esperado, intentar devolver un array vacío para seguridad
      result = []
    }

    // Guardar en caché
    CacheService.set(cacheKey, result, filters)

    return result
  }

  async getById(id: string): Promise<Verificacion> {
    const cacheKey = `verificacion_${id}_cache`
    const cached = CacheService.get<Verificacion>(cacheKey, undefined, CACHE_DURATION)
    if (cached) {
      console.log(`📦 Usando verificacion ${id} desde caché`)
      return cached
    }

    console.log(`🌐 Obteniendo verificacion ${id} desde API REST`)
    const response = await axiosInstance.get(`/verificaciones/${id}`)

    CacheService.set(cacheKey, response.data)

    return response.data
  }

  async create(verificacion: CrateVerificacionDto): Promise<Verificacion> {
    try {
      const response = await axiosInstance.post('/verificaciones', verificacion)

      // Guardar en caché el nuevo recurso
      const cacheKey = `verificacion_${response.data.id}_cache`
      CacheService.set(cacheKey, response.data)

      // Limpiar listas en caché
      this.clearCache()

      return response.data
    } catch (error) {
      throw error
    }
  }

  async update(id: string, verificacion: UpdateVerificacionDto) {
    try {
      const response = await axiosInstance.put(`/verificaciones/${id}`, verificacion)

      // Actualizar el caché de la verificación individual para que refleje los cambios
      const cacheKey = `verificacion_${id}_cache`
      CacheService.set(cacheKey, response.data)

      // Limpiar cachés de listas para evitar inconsistencias en listados
      this.clearCache()

      return response.data
    } catch (error) {
      throw error
    }
  }

  async delete(id: string) {
    try {
      const response = await axiosInstance.delete(`/verificaciones/${id}`)

      // Eliminar cache individual y limpiar listas
      const cacheKey = `verificacion_${id}_cache`
      CacheService.remove(cacheKey)
      this.clearCache()

      return response.data
    } catch (error) {
      throw error
    }
  }

  async search(query: string): Promise<Verificacion[]> {
    const cacheKey = 'verificaciones_search_cache'
    const cached = CacheService.get<Verificacion[]>(cacheKey, { query }, CACHE_DURATION)
    if (cached) {
      console.log(`📦 Usando búsqueda de verificaciones "${query}" desde caché`)
      return cached
    }

    console.log(`🌐 Buscando verificaciones "${query}" en API REST`)
    const response = await axiosInstance.get(`/verificaciones/search?q=${encodeURIComponent(query)}`)

    // Extraer lista (similar a getAll)
    let result: Verificacion[] = []
    if (Array.isArray(response.data)) {
      result = response.data
    } else if (response.data && Array.isArray(response.data.verificaciones)) {
      result = response.data.verificaciones
    } else {
      result = []
    }

    CacheService.set(cacheKey, result, { query })

    return result
  }

  // Método para limpiar el caché manualmente
  clearCache(): void {
    // Limpiar todos los cachés relacionados con verificaciones
    CacheService.clearByPattern('verificaciones')
    // En caso de que exista alguna clave singular no cubierta, eliminar explícitamente
    CacheService.remove('verificaciones_all_cache')
    CacheService.remove('verificaciones_search_cache')
    console.log('🗑️ Caché de verificaciones limpiado')
  }
}

export default new VerificacionService()
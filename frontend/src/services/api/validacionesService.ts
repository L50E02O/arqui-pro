import axiosInstance from './axiosInstance'
import { CacheService } from '../../utils/cacheService'
import type { Valoracion, CreateValoracionDto, UpdateValoracionDto } from '../../types/valoracion.types'

const CACHE_DURATION = 3 * 60 * 1000 // 3 minutos

class ValidacionesService {
  /**
   * Obtener todas las valoraciones
   */
  async getAll(): Promise<Valoracion[]> {
    const cacheKey = 'valoraciones_all_cache'
    const cached = CacheService.get<Valoracion[]>(cacheKey, undefined, CACHE_DURATION)
    if (cached) {
      console.log('Usando valoraciones desde caché')
      return cached
    }

    console.log('Obteniendo valoraciones desde API REST')
    const response = await axiosInstance.get('/valoraciones')
    const result = Array.isArray(response.data) ? response.data : response.data.valoraciones || []
    CacheService.set(cacheKey, result)
    return result
  }

  /**
   * Obtener una valoración por ID
   */
  async getById(id: string): Promise<Valoracion> {
    const cacheKey = `valoracion_${id}_cache`
    const cached = CacheService.get<Valoracion>(cacheKey, undefined, CACHE_DURATION)
    if (cached) {
      console.log(`Usando valoración ${id} desde caché`)
      return cached
    }

    console.log(`Obteniendo valoración ${id} desde API REST`)
    const response = await axiosInstance.get(`/valoraciones/${id}`)
    CacheService.set(cacheKey, response.data)
    return response.data
  }

  /**
   * Obtener todas las valoraciones de un proyecto específico
   */
  async getByProyecto(proyectoId: string): Promise<Valoracion[]> {
    const cacheKey = `valoraciones_proyecto_${proyectoId}_cache`
    const cached = CacheService.get<Valoracion[]>(cacheKey, undefined, CACHE_DURATION)
    if (cached) {
      console.log(`Usando valoraciones del proyecto ${proyectoId} desde caché`)
      return cached
    }

    console.log(`Obteniendo valoraciones del proyecto ${proyectoId} desde API REST`)
    const response = await axiosInstance.get(`/valoraciones?proyecto_id=${proyectoId}`)
    const result = Array.isArray(response.data) ? response.data : response.data.valoraciones || []
    CacheService.set(cacheKey, result)
    return result
  }

  /**
   * Obtener todas las valoraciones de un cliente específico
   */
  async getByCliente(clienteId: string): Promise<Valoracion[]> {
    const cacheKey = `valoraciones_cliente_${clienteId}_cache`
    const cached = CacheService.get<Valoracion[]>(cacheKey, undefined, CACHE_DURATION)
    if (cached) {
      console.log(`Usando valoraciones del cliente ${clienteId} desde caché`)
      return cached
    }

    console.log(`Obteniendo valoraciones del cliente ${clienteId} desde API REST`)
    const response = await axiosInstance.get(`/valoraciones?cliente_id=${clienteId}`)
    const result = Array.isArray(response.data) ? response.data : response.data.valoraciones || []
    CacheService.set(cacheKey, result)
    return result
  }

  /**
   * Crear una nueva valoración
   */
  async create(valoracion: CreateValoracionDto): Promise<Valoracion> {
    console.log('Creando valoración en API REST')
    const response = await axiosInstance.post('/valoraciones', valoracion)
    this.clearCache()
    return response.data
  }

  /**
   * Actualizar una valoración
   */
  async update(id: string, valoracion: UpdateValoracionDto): Promise<Valoracion> {
    console.log(`Actualizando valoración ${id} en API REST`)
    const response = await axiosInstance.put(`/valoraciones/${id}`, valoracion)
    this.clearCache()
    return response.data
  }

  /**
   * Eliminar una valoración
   */
  async delete(id: string): Promise<void> {
    console.log(`Eliminando valoración ${id} en API REST`)
    await axiosInstance.delete(`/valoraciones/${id}`)
    this.clearCache()
  }

  /**
   * Limpiar caché de valoraciones
   */
  clearCache(): void {
    CacheService.clearByPattern('valoraciones_')
    console.log('Caché de valoraciones limpiado')
  }
}

export default new ValidacionesService()
import { useState, useEffect } from 'react'
import { CacheService } from '../utils/cacheService'

interface UseCachedDataOptions<T> {
  cacheKey: string
  fetchFunction: () => Promise<T>
  dependencies?: any[]
  duration?: number
  variables?: any
}

interface UseCachedDataResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  clearCache: () => void
}

/**
 * Hook personalizado para manejar datos con caché automático en localStorage
 * 
 * @example
 * ```typescript
 * const { data, loading, error, refetch } = useCachedData({
 *   cacheKey: 'proyectos_cache',
 *   fetchFunction: () => api.get('/proyectos').then(r => r.data),
 *   duration: 5 * 60 * 1000, // 5 minutos
 * })
 * ```
 */
export function useCachedData<T>({
  cacheKey,
  fetchFunction,
  dependencies = [],
  duration = 5 * 60 * 1000,
  variables
}: UseCachedDataOptions<T>): UseCachedDataResult<T> {
  const [data, setData] = useState<T | null>(() => 
    CacheService.get<T>(cacheKey, variables, duration)
  )
  const [loading, setLoading] = useState<boolean>(!data)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log(`🌐 Obteniendo datos desde API [${cacheKey}]`)
      const result = await fetchFunction()
      
      setData(result)
      CacheService.set(cacheKey, result, variables)
      console.log(`📦 Datos guardados en caché [${cacheKey}]`)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Error desconocido')
      setError(errorObj)
      console.error(`❌ Error obteniendo datos [${cacheKey}]:`, errorObj)
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    console.log(`🔄 Refrescando datos [${cacheKey}]`)
    CacheService.remove(cacheKey)
    setData(null)
    await fetchData()
  }

  const clearCache = () => {
    console.log(`🗑️ Limpiando caché [${cacheKey}]`)
    CacheService.remove(cacheKey)
    setData(null)
  }

  useEffect(() => {
    // Limpiar datos cuando cambian las dependencias
    console.log(`🔄 Dependencias cambiaron para [${cacheKey}] - Limpiando estado`)
    setData(null)
    setLoading(true)
    
    // Verificar si hay datos en caché
    const cachedData = CacheService.get<T>(cacheKey, variables, duration)
    if (cachedData) {
      console.log(`📦 Usando datos desde caché [${cacheKey}]`)
      setData(cachedData)
      setLoading(false)
      return
    }

    // Si no hay datos en caché, hacer fetch
    fetchData()
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies])

  return {
    data,
    loading,
    error,
    refetch,
    clearCache
  }
}

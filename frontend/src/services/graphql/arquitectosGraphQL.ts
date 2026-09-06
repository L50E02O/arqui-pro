import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { BUSCAR_ARQUITECTOS } from './queries'
import { CacheService } from '../../utils/cacheService'
import { logger } from '../../utils/logger'
import { CACHE } from '../../config/constants'

export interface ArquitectoGraphQL {
  id: number
  cedula: string
  especialidades: string
  descripcion: string
  valoracionPromedioProyecto: number
  verificado: boolean
  usuario: {
    id: number
    nombre: string
    apellido: string
    email: string
    fotoPerfil: string | null
  }
  proyectos: Array<{
    id: number
    tituloProyecto: string
    valoracionPromedio: number
  }>
}

export interface BuscarArquitectosData {
  buscarArquitectos: ArquitectoGraphQL[]
}

export interface BuscarArquitectosVariables {
  especialidad?: string
  verificado?: boolean
  valoracionMinima?: number
  limite?: number
}

export const useBuscarArquitectos = (variables?: BuscarArquitectosVariables) => {
  const [cachedArquitectos, setCachedArquitectos] = useState<ArquitectoGraphQL[] | null>(() => 
    CacheService.get<ArquitectoGraphQL[]>(CACHE.KEYS.ARQUITECTOS, variables, CACHE.DURATION)
  )

  const { data, loading, error, refetch } = useQuery<BuscarArquitectosData, BuscarArquitectosVariables>(
    BUSCAR_ARQUITECTOS,
    {
      variables,
      skip: cachedArquitectos !== null, // Saltar query si hay datos en caché
      fetchPolicy: 'network-only', // Cuando sí hace query, obtiene datos frescos
    }
  )

  // Guardar datos en caché cuando lleguen del servidor
  useEffect(() => {
    if (data?.buscarArquitectos) {
      logger.cache('set', CACHE.KEYS.ARQUITECTOS, { count: data.buscarArquitectos.length })
      CacheService.set(CACHE.KEYS.ARQUITECTOS, data.buscarArquitectos, variables)
      setCachedArquitectos(data.buscarArquitectos)
    }
  }, [data, variables])

  // Mostrar cuando se usa caché
  useEffect(() => {
    if (cachedArquitectos) {
      logger.cache('hit', CACHE.KEYS.ARQUITECTOS, { count: cachedArquitectos.length })
    }
  }, [])

  // Si hay datos en caché, usarlos
  const arquitectos = cachedArquitectos || data?.buscarArquitectos

  return {
    data: arquitectos ? { buscarArquitectos: arquitectos } : undefined,
    loading: cachedArquitectos ? false : loading,
    error,
    refetch: async () => {
      // Limpiar caché y forzar nuevo query
      logger.cache('clear', CACHE.KEYS.ARQUITECTOS)
      CacheService.remove(CACHE.KEYS.ARQUITECTOS)
      setCachedArquitectos(null)
      return refetch()
    }
  }
}

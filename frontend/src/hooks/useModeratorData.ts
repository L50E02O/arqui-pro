import { useQuery } from '@apollo/client'
import { GET_MODERATOR_STATS } from '../services/graphql/queries'
import type { ModeratorStats } from '../types/moderador.types'

interface KpisPlataforma {
  totalUsuarios: number
  totalProyectos: number
  arquitectosVerificados: number
  totalIncidencias: number
}

interface ModeratorStatsResponse {
  kpisPlataforma: KpisPlataforma
}

export const useModeratorData = () => {
  const { data, loading, error, refetch } = useQuery<ModeratorStatsResponse>(
    GET_MODERATOR_STATS,
    {
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    }
  )

  const stats: ModeratorStats | undefined = data
    ? {
        totalUsuarios: data.kpisPlataforma.totalUsuarios,
        totalProyectos: data.kpisPlataforma.totalProyectos,
        totalIncidencias: data.kpisPlataforma.totalIncidencias,
        arquitectosVerificados: data.kpisPlataforma.arquitectosVerificados,
        reportesPendientes: 0, // TODO: Add this to backend
        usuariosActivos: 0, // TODO: Add this to backend
        tasaVerificacion: data.kpisPlataforma.totalUsuarios > 0
          ? (data.kpisPlataforma.arquitectosVerificados / data.kpisPlataforma.totalUsuarios) * 100
          : 0
      }
    : undefined

  return {
    stats,
    loading,
    error,
    refetch
  }
}

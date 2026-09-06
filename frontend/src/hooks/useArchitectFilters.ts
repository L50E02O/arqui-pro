/**
 * Custom Hook para gestionar filtros de búsqueda de arquitectos
 * Separa la lógica de negocio del componente de presentación
 */

import { useState, useCallback, useMemo } from 'react'

export interface ArchitectFilters {
  especialidad: string
  rating: string
  searchText: string
}

export interface ArchitectFiltersVariables {
  especialidad?: string
  verificado?: boolean
  valoracionMinima?: number
  limite?: number
}

interface UseArchitectFiltersReturn {
  filters: ArchitectFilters
  variables: ArchitectFiltersVariables
  setEspecialidad: (value: string) => void
  setRating: (value: string) => void
  setSearchText: (value: string) => void
  resetFilters: () => void
  hasActiveFilters: boolean
}

const DEFAULT_FILTERS: ArchitectFilters = {
  especialidad: '',
  rating: '',
  searchText: '',
}

const DEFAULT_LIMIT = 15

export const useArchitectFilters = (): UseArchitectFiltersReturn => {
  const [especialidad, setEspecialidad] = useState(DEFAULT_FILTERS.especialidad)
  const [rating, setRating] = useState(DEFAULT_FILTERS.rating)
  const [searchText, setSearchText] = useState(DEFAULT_FILTERS.searchText)

  // Construir variables para GraphQL basadas en los filtros
  const variables = useMemo((): ArchitectFiltersVariables => {
    const vars: ArchitectFiltersVariables = {
      limite: DEFAULT_LIMIT,
      verificado: true, // Solo mostrar arquitectos verificados
    }

    if (especialidad) {
      vars.especialidad = especialidad
    }

    if (rating && rating !== '0') {
      vars.valoracionMinima = parseFloat(rating)
    }

    return vars
  }, [especialidad, rating])

  // Resetear todos los filtros
  const resetFilters = useCallback(() => {
    setEspecialidad(DEFAULT_FILTERS.especialidad)
    setRating(DEFAULT_FILTERS.rating)
    setSearchText(DEFAULT_FILTERS.searchText)
  }, [])

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return especialidad !== '' || rating !== '' || searchText !== ''
  }, [especialidad, rating, searchText])

  return {
    filters: {
      especialidad,
      rating,
      searchText,
    },
    variables,
    setEspecialidad,
    setRating,
    setSearchText,
    resetFilters,
    hasActiveFilters,
  }
}

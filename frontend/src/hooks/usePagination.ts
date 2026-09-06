/**
 * Custom Hook reutilizable para paginación
 * Maneja estado de página actual, límite por página y cálculos de offset
 */

import { useState, useCallback, useMemo } from 'react'
import { PAGINATION } from '../config/constants'

interface UsePaginationProps {
  initialPage?: number
  limit?: number
}

interface UsePaginationReturn {
  currentPage: number
  limit: number
  offset: number
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  resetPage: () => void
  canGoPrevious: boolean
  canGoNext: (totalItems: number) => boolean
}

export const usePagination = ({
  initialPage = PAGINATION.DEFAULT_PAGE,
  limit = PAGINATION.DEFAULT_LIMIT,
}: UsePaginationProps = {}): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage)

  // Calcular offset para queries
  const offset = useMemo(() => {
    return (currentPage - 1) * limit
  }, [currentPage, limit])

  // Ir a una página específica
  const goToPage = useCallback((page: number) => {
    if (page >= 1) {
      setCurrentPage(page)
    }
  }, [])

  // Ir a la siguiente página
  const nextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1)
  }, [])

  // Ir a la página anterior
  const previousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }, [])

  // Resetear a la primera página
  const resetPage = useCallback(() => {
    setCurrentPage(initialPage)
  }, [initialPage])

  // Verificar si se puede ir a la página anterior
  const canGoPrevious = currentPage > 1

  // Verificar si se puede ir a la siguiente página
  const canGoNext = useCallback(
    (totalItems: number): boolean => {
      return totalItems >= limit
    },
    [limit]
  )

  return {
    currentPage,
    limit,
    offset,
    goToPage,
    nextPage,
    previousPage,
    resetPage,
    canGoPrevious,
    canGoNext,
  }
}

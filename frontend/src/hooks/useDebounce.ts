/**
 * Custom Hook para debouncing
 * Útil para búsquedas y evitar llamadas excesivas al backend
 */

import { useState, useEffect } from 'react'

export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Crear un timeout que actualiza el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpiar el timeout si value cambia antes de que se ejecute
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

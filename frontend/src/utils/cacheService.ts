/**
 * Sistema de caché genérico para localStorage
 * Evita llamadas repetitivas al backend
 */

export interface CacheOptions {
  duration?: number // Duración en milisegundos (por defecto 5 minutos)
  key: string // Key única para este tipo de dato
}

interface CacheData<T> {
  data: T
  timestamp: number
  variables?: any
}

const DEFAULT_CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export class CacheService {
  /**
   * Obtiene datos del caché si están disponibles y no han expirado
   */
  static get<T>(key: string, variables?: any, duration: number = DEFAULT_CACHE_DURATION): T | null {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const cacheData: CacheData<T> = JSON.parse(cached)
      const now = Date.now()

      // Verificar si el caché expiró
      if (now - cacheData.timestamp > duration) {
        this.remove(key)
        return null
      }

      // Verificar si las variables coinciden (para queries con parámetros)
      if (variables !== undefined) {
        const varsMatch = JSON.stringify(variables) === JSON.stringify(cacheData.variables || {})
        if (!varsMatch) return null
      }

      return cacheData.data
    } catch (error) {
      console.error(`Error leyendo caché [${key}]:`, error)
      return null
    }
  }

  /**
   * Guarda datos en el caché
   */
  static set<T>(key: string, data: T, variables?: any): void {
    try {
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
        variables: variables || {}
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
    } catch (error) {
      console.error(`Error guardando caché [${key}]:`, error)
      // Si el localStorage está lleno, limpiar cachés antiguos
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldCache()
        // Intentar de nuevo
        try {
          localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now(), variables }))
        } catch (retryError) {
          console.error('Error guardando caché después de limpiar:', retryError)
        }
      }
    }
  }

  /**
   * Elimina un caché específico
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error eliminando caché [${key}]:`, error)
    }
  }

  /**
   * Limpia todos los cachés de la aplicación
   */
  static clearAll(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.endsWith('_cache')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error limpiando todos los cachés:', error)
    }
  }

  /**
   * Limpia cachés que coincidan con un patrón
   */
  static clearByPattern(pattern: string): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.includes(pattern) && key.endsWith('_cache')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error(`Error limpiando cachés con patrón [${pattern}]:`, error)
    }
  }

  /**
   * Limpia cachés que hayan expirado
   */
  static clearOldCache(): void {
    try {
      const keys = Object.keys(localStorage)
      const now = Date.now()
      
      keys.forEach(key => {
        if (key.endsWith('_cache')) {
          try {
            const cached = localStorage.getItem(key)
            if (cached) {
              const cacheData = JSON.parse(cached)
              // Si tiene más de 1 hora, eliminarlo
              if (now - cacheData.timestamp > 60 * 60 * 1000) {
                localStorage.removeItem(key)
              }
            }
          } catch (e) {
            // Si hay error parseando, eliminar el item
            localStorage.removeItem(key)
          }
        }
      })
    } catch (error) {
      console.error('Error limpiando cachés antiguos:', error)
    }
  }

  /**
   * Obtiene el tamaño del localStorage usado (en bytes aproximados)
   */
  static getStorageSize(): number {
    let total = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  }
}

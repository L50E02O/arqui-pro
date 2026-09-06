/**
 * Utilidades de formateo reutilizables
 */

import { BADGE_COLORS, INCIDENCIA_ESTADO_LABELS } from '../config/constants'

/**
 * Formatea una fecha en formato localizado español
 */
export const formatDate = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  return new Date(dateString).toLocaleDateString('es-ES', options || defaultOptions)
}

/**
 * Formatea una fecha con hora incluida
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Obtiene la clase CSS del badge según el estado
 */
export const getBadgeClass = (estado: string): string => {
  const estadoUpper = estado.toUpperCase().replace(' ', '_')
  
  const colorMap: Record<string, string> = {
    PENDIENTE: BADGE_COLORS.PENDIENTE,
    APROBADO: BADGE_COLORS.APROBADO,
    EN_REVISION: BADGE_COLORS.EN_REVISION,
    RESUELTO: BADGE_COLORS.RESUELTO,
    RECHAZADO: BADGE_COLORS.RECHAZADO,
  }

  const color = colorMap[estadoUpper] || BADGE_COLORS.DEFAULT

  return `badge badge--${color}`
}

/**
 * Obtiene el label legible de un estado de incidencia
 */
export const getIncidenciaEstadoLabel = (estado: string): string => {
  return INCIDENCIA_ESTADO_LABELS[estado] || estado
}

/**
 * Trunca un texto a una longitud máxima y agrega "..."
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Formatea un número con separadores de miles
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('es-ES')
}

/**
 * Formatea un porcentaje con decimales
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Obtiene las iniciales de un nombre completo
 */
export const getInitials = (firstName: string, lastName: string): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return `${first}${last}`
}

/**
 * Genera un color de avatar basado en un string (nombre)
 */
export const getAvatarColor = (name: string, colors: readonly string[]): string => {
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

/**
 * Valida si un email es válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Capitaliza la primera letra de un string
 */
export const capitalize = (text: string): string => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Convierte snake_case a camelCase
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Convierte camelCase a snake_case
 */
export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

/**
 * Logger Service - Reemplaza console.log con logging configurable
 * En producción no imprime logs, en desarrollo sí
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class LoggerService {
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = import.meta.env.DEV
  }

  private shouldLog(): boolean {
    return this.isDevelopment
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog()) {
      console.log(this.formatMessage('debug', message), data !== undefined ? data : '')
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog()) {
      console.info(this.formatMessage('info', message), data !== undefined ? data : '')
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog()) {
      console.warn(this.formatMessage('warn', message), data !== undefined ? data : '')
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog()) {
      console.error(this.formatMessage('error', message), error || '')
    }
  }

  // Métodos específicos para contextos comunes
  cache(action: 'hit' | 'miss' | 'set' | 'clear', key: string, data?: any): void {
    const emoji = {
      hit: '✅',
      miss: '❌',
      set: '📦',
      clear: '🗑️',
    }[action]

    this.debug(`${emoji} Cache ${action}: ${key}`, data)
  }

  api(method: string, url: string, status?: number, data?: any): void {
    const emoji = status && status >= 200 && status < 300 ? '✅' : '❌'
    this.debug(`${emoji} API ${method} ${url} ${status ? `[${status}]` : ''}`, data)
  }

  graphql(operationName: string, variables?: any, error?: any): void {
    if (error) {
      this.error(`🔴 GraphQL Error: ${operationName}`, error)
    } else {
      this.debug(`🟢 GraphQL: ${operationName}`, variables)
    }
  }
}

// Export singleton instance
export const logger = new LoggerService()

// Export class for testing
export default LoggerService

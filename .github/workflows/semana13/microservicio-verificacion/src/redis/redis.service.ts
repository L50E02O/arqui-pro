import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Servicio Redis para implementar consumidor idempotente
 * Almacena claves de idempotencia para evitar procesamiento duplicado
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private readonly TTL = 86400; // 24 horas en segundos

  /**
   * Inicializa la conexión con Redis
   */
  async onModuleInit() {
    try {
      const host = process.env.REDIS_HOST || 'localhost';
      const port = parseInt(process.env.REDIS_PORT || '6379');

      this.client = new Redis({
        host,
        port,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.client.on('connect', () => {
        this.logger.log('Conectado a Redis exitosamente');
      });

      this.client.on('error', (error) => {
        this.logger.error('Error en Redis:', error);
      });
    } catch (error) {
      this.logger.error('Error al conectar con Redis:', error);
      throw error;
    }
  }

  /**
   * Cierra la conexión con Redis
   */
  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Conexión con Redis cerrada');
    }
  }

  /**
   * Verifica si una clave de idempotencia ya fue procesada
   * @param key - Clave de idempotencia
   * @returns El resultado procesado si existe, null si no existe
   */
  async checkIdempotency(key: string): Promise<any | null> {
    try {
      const value = await this.client.get(`idempotency:${key}`);
      if (value) {
        this.logger.log(`Clave de idempotencia encontrada: ${key}`);
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      this.logger.error(`Error al verificar idempotencia ${key}:`, error);
      // En caso de error, permitir el procesamiento para no bloquear el sistema
      return null;
    }
  }

  /**
   * Guarda una clave de idempotencia con el resultado procesado
   * @param key - Clave de idempotencia
   * @param result - Resultado a almacenar
   */
  async saveIdempotency(key: string, result: any): Promise<void> {
    try {
      const value = JSON.stringify(result);
      await this.client.setex(`idempotency:${key}`, this.TTL, value);
      this.logger.log(`Clave de idempotencia guardada: ${key}`);
    } catch (error) {
      this.logger.error(`Error al guardar idempotencia ${key}:`, error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Elimina una clave de idempotencia (útil para testing)
   * @param key - Clave de idempotencia
   */
  async deleteIdempotency(key: string): Promise<void> {
    try {
      await this.client.del(`idempotency:${key}`);
      this.logger.log(`Clave de idempotencia eliminada: ${key}`);
    } catch (error) {
      this.logger.error(`Error al eliminar idempotencia ${key}:`, error);
    }
  }
}


import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

/**
 * Servicio RabbitMQ para comunicación con otros microservicios
 * Publica eventos de dominio (no usa RPC, solo eventos asíncronos)
 */
@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly logger = new Logger(RabbitMQService.name);
  private readonly exchange = process.env.RABBITMQ_EXCHANGE || 'arquitecto.exchange';

  /**
   * Inicializa la conexión con RabbitMQ
   */
  async onModuleInit() {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
      
      // Conexión para publicar eventos
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

      // Configurar binding para escuchar eventos de arquitecto
      // Esto permite que el microservicio de Verificación reciba eventos 'arquitecto.creado'
      // Usamos una cola separada para eventos (no para RPC)
      const verificacionEventsQueue = process.env.RABBITMQ_QUEUE_EVENTOS || 'verificacion.eventos.queue';
      await this.channel.assertQueue(verificacionEventsQueue, { durable: true });
      await this.channel.bindQueue(verificacionEventsQueue, this.exchange, 'arquitecto.creado');
      await this.channel.bindQueue(verificacionEventsQueue, this.exchange, 'arquitecto.*');
      
      this.logger.log(`Binding configurado: ${verificacionEventsQueue} escucha eventos de ${this.exchange}`);
      this.logger.log('Conectado a RabbitMQ exitosamente');
    } catch (error) {
      this.logger.error('Error al conectar con RabbitMQ:', error);
      throw error;
    }
  }

  /**
   * Cierra la conexión con RabbitMQ
   */
  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.logger.log('Conexión con RabbitMQ cerrada');
  }

  /**
   * Publica un evento de dominio
   * @param routingKey - Clave de enrutamiento (ej: 'verificacion.solicitada')
   * @param payload - Datos del evento
   */
  async publishEvent(routingKey: string, payload: any): Promise<void> {
    if (!this.channel) {
      throw new Error('Canal de RabbitMQ no está inicializado');
    }

    try {
      const message = JSON.stringify(payload);
      const published = this.channel.publish(
        this.exchange,
        routingKey,
        Buffer.from(message),
        {
          persistent: true,
          timestamp: Date.now(),
        },
      );

      if (published) {
        this.logger.log(`Evento publicado: ${routingKey}`);
      } else {
        this.logger.warn(`No se pudo publicar evento: ${routingKey}`);
      }
    } catch (error) {
      this.logger.error(`Error al publicar evento ${routingKey}:`, error);
      throw error;
    }
  }

}


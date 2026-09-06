import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { VerificacionService } from '../verificacion/verificacion.service';

/**
 * Servicio que escucha eventos de dominio desde RabbitMQ
 * Escucha el evento 'arquitecto.creado' y crea automáticamente una verificación
 */
@Injectable()
export class EventListenerService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly logger = new Logger(EventListenerService.name);
  private readonly exchange = process.env.RABBITMQ_EXCHANGE || 'arquitecto.exchange';
  private readonly queue = process.env.RABBITMQ_QUEUE_EVENTOS || 'verificacion.eventos.queue';

  constructor(private readonly verificacionService: VerificacionService) {}

  /**
   * Inicializa el listener de eventos
   */
  async onModuleInit() {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
      
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      
      // Declarar exchange
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      
      // Declarar cola para eventos
      await this.channel.assertQueue(this.queue, { durable: true });
      
      // Binding: escuchar eventos 'arquitecto.creado'
      await this.channel.bindQueue(this.queue, this.exchange, 'arquitecto.creado');
      
      this.logger.log(`Escuchando eventos 'arquitecto.creado' en cola ${this.queue}`);
      
      // Consumir mensajes de la cola
      await this.channel.consume(
        this.queue,
        async (msg) => {
          if (msg) {
            try {
              const content = JSON.parse(msg.content.toString());
              const routingKey = msg.fields.routingKey;
              
              this.logger.log(`Evento recibido: ${routingKey}`);
              
              if (routingKey === 'arquitecto.creado') {
                await this.handleArquitectoCreado(content);
              }
              
              // ACK del mensaje
              this.channel?.ack(msg);
            } catch (error) {
              this.logger.error(`Error al procesar evento:`, error);
              // NACK del mensaje para reintento
              this.channel?.nack(msg, false, true);
            }
          }
        },
        { noAck: false }
      );
      
      this.logger.log('EventListenerService iniciado correctamente');
    } catch (error) {
      this.logger.error('Error al inicializar EventListenerService:', error);
      throw error;
    }
  }

  /**
   * Maneja el evento 'arquitecto.creado'
   */
  private async handleArquitectoCreado(data: { id: string; cedula: string; usuario_id: string; timestamp: string }) {
    try {
      this.logger.log(`Procesando evento arquitecto.creado para arquitecto ${data.id}`);
      await this.verificacionService.crearVerificacionAutomatica(data.id, data.usuario_id);
      this.logger.log(`Verificación automática creada para arquitecto ${data.id}`);
    } catch (error) {
      this.logger.error(`Error al crear verificación automática para arquitecto ${data.id}:`, error);
      throw error;
    }
  }

  /**
   * Cierra las conexiones
   */
  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.logger.log('EventListenerService cerrado');
  }
}


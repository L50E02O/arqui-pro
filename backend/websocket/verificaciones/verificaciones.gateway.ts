import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/verificaciones',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
})
export class VerificacionesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(VerificacionesGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`[CONN]  Cliente conectado al namespace /verificaciones: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[CONN]  Cliente desconectado del namespace /verificaciones: ${client.id}`);
  }

  /**
   * Emitir evento cuando un arquitecto es verificado
   */
  emitArquitectoVerificado(data: {
    arquitecto_id: string;
    verificacion_id: string;
    moderador_id: string;
    fecha_verificacion: string;
  }) {
    this.logger.log(`[BROADCAST]  Emitiendo verificación aprobada para arquitecto: ${data.arquitecto_id}`);
    
    // Notificar al arquitecto
    this.server.to(`arquitecto:${data.arquitecto_id}`).emit('verificacion:aprobada', data);
    
    // Notificar a todos los moderadores para actualizar stats
    this.server.emit('verificacion:nueva_verificacion', data);
    
    this.logger.log(`   [SUCCESS]  Evento emitido a sala arquitecto:${data.arquitecto_id} y broadcast general`);
  }

  /**
   * Emitir evento cuando una verificación es rechazada
   */
  emitArquitectoRechazado(data: {
    arquitecto_id: string;
    verificacion_id: string;
    moderador_id: string;
    motivo_rechazo?: string;
  }) {
    this.logger.log(`[BROADCAST]  Emitiendo verificación rechazada para arquitecto: ${data.arquitecto_id}`);
    
    // Notificar al arquitecto
    this.server.to(`arquitecto:${data.arquitecto_id}`).emit('verificacion:rechazada', data);
    
    // Notificar a moderadores
    this.server.emit('verificacion:rechazo', data);
  }

  /**
   * Emitir evento cuando se crea una nueva solicitud de verificación
   */
  emitNuevaSolicitudVerificacion(data: {
    arquitecto_id: string;
    verificacion_id: string;
    fecha_solicitud: string;
  }) {
    this.logger.log(`[BROADCAST]  Emitiendo nueva solicitud de verificación: ${data.verificacion_id}`);
    
    // Notificar a todos los moderadores
    this.server.emit('verificacion:nueva_solicitud', data);
  }
}

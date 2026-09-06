import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/valoraciones',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
})
export class ValoracionesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ValoracionesGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`[CONN]  Cliente conectado al namespace /valoraciones: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[CONN]  Cliente desconectado del namespace /valoraciones: ${client.id}`);
  }

  /**
   * Unirse a la sala de un proyecto para recibir valoraciones
   */
  @SubscribeMessage('join_proyecto')
  handleJoinProyecto(
    @MessageBody() payload: { proyecto_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `proyecto:${payload.proyecto_id}`;
    client.join(room);
    this.logger.log(`[DIR]  Cliente ${client.id} se unió a sala de valoraciones ${room}`);
    return { status: 'ok', room };
  }

  /**
   * Unirse a la sala de un arquitecto para recibir todas sus valoraciones
   */
  @SubscribeMessage('join_arquitecto')
  handleJoinArquitecto(
    @MessageBody() payload: { arquitecto_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `arquitecto:${payload.arquitecto_id}`;
    client.join(room);
    this.logger.log(`[USER]  Cliente ${client.id} se unió a sala de valoraciones del arquitecto`);
    this.logger.log(`   Arquitecto ID: ${payload.arquitecto_id}`);
    this.logger.log(`   Sala: ${room}`);
    return { status: 'ok', room };
  }

  /**
   * Unirse a la sala de un cliente para recibir notificaciones sobre sus valoraciones
   */
  @SubscribeMessage('join_cliente')
  handleJoinCliente(
    @MessageBody() payload: { cliente_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `cliente:${payload.cliente_id}`;
    client.join(room);
    this.logger.log(`[GROUP]  Cliente ${client.id} se unió a sala de valoraciones ${room}`);
    return { status: 'ok', room };
  }

  /**
   * Emitir evento de nueva valoración
   */
  emitNuevaValoracion(
    proyecto_id: string,
    arquitecto_id: string,
    cliente_id: string,
    valoracion: any,
  ) {
    this.logger.log(`[BROADCAST]  Emitiendo nueva valoración en proyecto: ${proyecto_id}`);
    this.logger.log(`   Calificación: ${valoracion.calificacion}`);
    
    // Emitir a todos los que siguen el proyecto
    this.server.to(`proyecto:${proyecto_id}`).emit('valoracion:nueva', valoracion);
    
    // Notificar al arquitecto
    this.server.to(`arquitecto:${arquitecto_id}`).emit('valoracion:nueva', valoracion);
    
    // Notificar al cliente que dejó la valoración
    this.server.to(`cliente:${cliente_id}`).emit('valoracion:nueva', valoracion);
  }

  /**
   * Emitir evento de actualización de valoración promedio del arquitecto
   */
  emitValoracionPromedioActualizada(
    arquitecto_id: string,
    data: { valoracion_promedio: number; total_valoraciones: number },
  ) {
    this.logger.log(`[BROADCAST]  Emitiendo actualización de valoración promedio del arquitecto: ${arquitecto_id}`);
    this.logger.log(`   Nuevo promedio: ${data.valoracion_promedio}`);
    this.logger.log(`   Total valoraciones: ${data.total_valoraciones}`);
    this.logger.log(`   Sala destino: arquitecto:${arquitecto_id}`);
    
    this.server.to(`arquitecto:${arquitecto_id}`).emit('valoracion:promedio_actualizado', data);
    
    this.logger.log(`[SUCCESS]  Evento emitido a sala arquitecto:${arquitecto_id}`);
  }

  /**
   * Emitir evento de actualización de valoración
   */
  emitValoracionActualizada(
    proyecto_id: string,
    arquitecto_id: string,
    valoracion: any,
  ) {
    this.logger.log(`[BROADCAST]  Emitiendo valoración actualizada: ${valoracion.id}`);
    
    this.server.to(`proyecto:${proyecto_id}`).emit('valoracion:actualizada', valoracion);
    this.server.to(`arquitecto:${arquitecto_id}`).emit('valoracion:actualizada', valoracion);
  }

  /**
   * Emitir evento de eliminación de valoración
   */
  emitValoracionEliminada(
    proyecto_id: string,
    arquitecto_id: string,
    valoracion_id: string,
  ) {
    this.logger.log(`[BROADCAST]  Emitiendo valoración eliminada: ${valoracion_id}`);
    
    this.server.to(`proyecto:${proyecto_id}`).emit('valoracion:eliminada', { valoracion_id });
    this.server.to(`arquitecto:${arquitecto_id}`).emit('valoracion:eliminada', { valoracion_id });
  }
}

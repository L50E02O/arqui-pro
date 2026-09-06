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
  namespace: '/proyectos',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
})
export class ProyectoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ProyectoGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`[CONN]  Cliente conectado al namespace /proyectos: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[CONN]  Cliente desconectado del namespace /proyectos: ${client.id}`);
  }

  /**
   * Unirse a la sala de un arquitecto específico para recibir notificaciones de sus proyectos
   */
  @SubscribeMessage('join_arquitecto')
  handleJoinArquitecto(
    @MessageBody() payload: { arquitecto_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `arquitecto:${payload.arquitecto_id}`;
    client.join(room);
    this.logger.log(`[USER]  Cliente ${client.id} se unió a sala ${room}`);
    return { status: 'ok', room };
  }

  /**
   * Unirse a la sala de un proyecto específico
   */
  @SubscribeMessage('join_proyecto')
  handleJoinProyecto(
    @MessageBody() payload: { proyecto_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `proyecto:${payload.proyecto_id}`;
    client.join(room);
    this.logger.log(`[DIR]  Cliente ${client.id} se unió a sala ${room}`);
    return { status: 'ok', room };
  }

  /**
   * Unirse a la sala de un cliente específico para recibir notificaciones de proyectos asignados
   */
  @SubscribeMessage('join_cliente')
  handleJoinCliente(
    @MessageBody() payload: { cliente_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `cliente:${payload.cliente_id}`;
    client.join(room);
    this.logger.log(`[GROUP]  Cliente ${client.id} se unió a sala ${room}`);
    return { status: 'ok', room };
  }

  /**
   * Emitir evento de nuevo proyecto a un arquitecto
   */
  emitNuevoProyecto(arquitecto_id: string, proyecto: any) {
    const room = `arquitecto:${arquitecto_id}`;
    this.logger.log(`[BROADCAST]  Emitiendo nuevo proyecto a sala ${room}`);
    this.server.to(room).emit('proyecto:nuevo', proyecto);
  }

  /**
   * Emitir evento de actualización de proyecto
   */
  emitProyectoActualizado(proyecto_id: string, arquitecto_id: string, proyecto: any) {
    this.logger.log(`[BROADCAST]  Emitiendo proyecto actualizado: ${proyecto_id}`);
    this.server.to(`proyecto:${proyecto_id}`).emit('proyecto:actualizado', proyecto);
    this.server.to(`arquitecto:${arquitecto_id}`).emit('proyecto:actualizado', proyecto);
    
    // Si tiene cliente asignado, notificar también
    if (proyecto.cliente_id) {
      this.server.to(`cliente:${proyecto.cliente_id}`).emit('proyecto:actualizado', proyecto);
    }
  }

  /**
   * Emitir evento de cambio de estado de proyecto
   */
  emitProyectoEstadoCambiado(proyecto_id: string, arquitecto_id: string, cliente_id: string | null, data: any) {
    this.logger.log(`[BROADCAST]  Emitiendo cambio de estado de proyecto: ${proyecto_id}`);
    this.server.to(`proyecto:${proyecto_id}`).emit('proyecto:estado_cambiado', data);
    this.server.to(`arquitecto:${arquitecto_id}`).emit('proyecto:estado_cambiado', data);
    
    if (cliente_id) {
      this.server.to(`cliente:${cliente_id}`).emit('proyecto:estado_cambiado', data);
    }
  }

  /**
   * Emitir evento de proyecto asignado a cliente
   */
  emitProyectoAsignado(cliente_id: string, proyecto: any) {
    const room = `cliente:${cliente_id}`;
    this.logger.log(`[BROADCAST]  Emitiendo proyecto asignado a sala ${room}`);
    this.server.to(room).emit('proyecto:asignado', proyecto);
  }
}

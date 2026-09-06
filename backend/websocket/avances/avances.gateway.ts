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
  namespace: '/avances',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
})
export class AvancesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AvancesGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`[CONN]  Cliente conectado al namespace /avances: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[CONN]  Cliente desconectado del namespace /avances: ${client.id}`);
  }

  /**
   * Unirse a la sala de un proyecto para recibir notificaciones de sus avances
   */
  @SubscribeMessage('join_proyecto')
  handleJoinProyecto(
    @MessageBody() payload: { proyecto_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `proyecto:${payload.proyecto_id}`;
    client.join(room);
    this.logger.log(`[DIR]  Cliente ${client.id} se unió a sala de avances ${room}`);
    return { status: 'ok', room };
  }

  /**
   * Unirse a la sala de un arquitecto para recibir todos sus avances
   */
  @SubscribeMessage('join_arquitecto')
  handleJoinArquitecto(
    @MessageBody() payload: { arquitecto_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `arquitecto:${payload.arquitecto_id}`;
    client.join(room);
    this.logger.log(`[USER]  Cliente ${client.id} se unió a sala de avances ${room}`);
    return { status: 'ok', room };
  }

  /**
   * Emitir evento de nuevo avance en un proyecto
   */
  emitNuevoAvance(proyecto_id: string, arquitecto_id: string, cliente_id: string | null, avance: any) {
    this.logger.log(`[BROADCAST]  Emitiendo nuevo avance en proyecto: ${proyecto_id}`);
    
    // Emitir a todos los que siguen el proyecto
    this.server.to(`proyecto:${proyecto_id}`).emit('avance:nuevo', avance);
    
    // Emitir al arquitecto
    this.server.to(`arquitecto:${arquitecto_id}`).emit('avance:nuevo', avance);
    
    // Si hay cliente asignado, notificar también
    if (cliente_id) {
      this.server.to(`cliente:${cliente_id}`).emit('avance:nuevo', avance);
    }
  }

  /**
   * Unirse a la sala de un cliente para recibir avances de sus proyectos
   */
  @SubscribeMessage('join_cliente')
  handleJoinCliente(
    @MessageBody() payload: { cliente_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `cliente:${payload.cliente_id}`;
    client.join(room);
    this.logger.log(`[GROUP]  Cliente ${client.id} se unió a sala de avances ${room}`);
    return { status: 'ok', room };
  }

  /**
   * Emitir evento de actualización de avance
   */
  emitAvanceActualizado(proyecto_id: string, avance: any) {
    this.logger.log(`[BROADCAST]  Emitiendo avance actualizado: ${avance.id}`);
    this.server.to(`proyecto:${proyecto_id}`).emit('avance:actualizado', avance);
  }

  /**
   * Emitir evento de eliminación de avance
   */
  emitAvanceEliminado(proyecto_id: string, avance_id: string) {
    this.logger.log(`[BROADCAST]  Emitiendo avance eliminado: ${avance_id}`);
    this.server.to(`proyecto:${proyecto_id}`).emit('avance:eliminado', { avance_id });
  }
}

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
  namespace: '/incidencias',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
})
export class IncidenciasGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(IncidenciasGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`[CONN]  Cliente conectado al namespace /incidencias: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[CONN]  Cliente desconectado del namespace /incidencias: ${client.id}`);
  }

  /**
   * Unirse a la sala de un usuario para recibir notificaciones de incidencias
   */
  @SubscribeMessage('join_usuario')
  handleJoinUsuario(
    @MessageBody() payload: { usuario_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `usuario:${payload.usuario_id}`;
    client.join(room);
    this.logger.log(`[USER]  Cliente ${client.id} se unió a sala de incidencias ${room}`);
    return { status: 'ok', room };
  }

  /**
   * Unirse a la sala de moderadores para recibir todas las incidencias
   */
  @SubscribeMessage('join_moderadores')
  handleJoinModeradores(
    @ConnectedSocket() client: Socket,
  ) {
    const room = 'moderadores';
    client.join(room);
    this.logger.log(`[MOD]  Cliente ${client.id} se unió a sala de moderadores`);
    return { status: 'ok', room };
  }

  /**
   * Unirse a la sala de una incidencia específica
   */
  @SubscribeMessage('join_incidencia')
  handleJoinIncidencia(
    @MessageBody() payload: { incidencia_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `incidencia:${payload.incidencia_id}`;
    client.join(room);
    this.logger.log(`[LIST]  Cliente ${client.id} se unió a sala ${room}`);
    return { status: 'ok', room };
  }

  /**
   * Unirse a la sala de un arquitecto para recibir incidencias de sus proyectos
   */
  @SubscribeMessage('join_arquitecto')
  handleJoinArquitecto(
    @MessageBody() payload: { arquitecto_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `arquitecto:${payload.arquitecto_id}`;
    client.join(room);
    this.logger.log(`‍ Cliente ${client.id} se unió a sala de incidencias ${room}`);
    return { status: 'ok', room };
  }

  /**
   * Unirse a la sala de un proyecto para recibir sus incidencias
   */
  @SubscribeMessage('join_proyecto')
  handleJoinProyecto(
    @MessageBody() payload: { proyecto_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `proyecto:${payload.proyecto_id}`;
    client.join(room);
    this.logger.log(`[DIR]  Cliente ${client.id} se unió a sala de incidencias ${room}`);
    return { status: 'ok', room };
  }

  /**
   * Emitir evento de nueva incidencia
   */
  emitNuevaIncidencia(
    usuario_emisor_id: string,
    usuario_infractor_id: string,
    incidencia: any,
    arquitecto_id?: string,
    proyecto_id?: string,
  ) {
    this.logger.log(`[BROADCAST]  Emitiendo nueva incidencia: ${incidencia.id}`);
    
    // Notificar al usuario emisor
    this.server.to(`usuario:${usuario_emisor_id}`).emit('incidencia:nueva', incidencia);
    
    // Notificar al usuario infractor
    this.server.to(`usuario:${usuario_infractor_id}`).emit('incidencia:nueva', incidencia);
    
    // Notificar a todos los moderadores
    this.server.to('moderadores').emit('incidencia:nueva', incidencia);
    
    // Si la incidencia está relacionada con un proyecto, notificar al arquitecto
    if (arquitecto_id) {
      this.logger.log(`   [BROADCAST]  Notificando al arquitecto: ${arquitecto_id}`);
      this.server.to(`arquitecto:${arquitecto_id}`).emit('incidencia:nueva', incidencia);
    }
    
    // Notificar a todos los que siguen el proyecto
    if (proyecto_id) {
      this.server.to(`proyecto:${proyecto_id}`).emit('incidencia:nueva', incidencia);
    }
  }

  /**
   * Emitir evento de cambio de estado de incidencia
   */
  emitIncidenciaEstadoCambiado(
    incidencia_id: string,
    usuario_emisor_id: string,
    usuario_infractor_id: string,
    data: any,
    arquitecto_id?: string,
    proyecto_id?: string,
  ) {
    this.logger.log(`[BROADCAST]  Emitiendo cambio de estado de incidencia: ${incidencia_id}`);
    this.logger.log(`   Estado: ${data.estado_anterior} → ${data.estado_nuevo}`);
    
    // Emitir a la sala de la incidencia
    this.server.to(`incidencia:${incidencia_id}`).emit('incidencia:estado_cambiado', data);
    
    // Notificar al usuario emisor
    this.server.to(`usuario:${usuario_emisor_id}`).emit('incidencia:estado_cambiado', data);
    
    // Notificar al usuario infractor
    this.server.to(`usuario:${usuario_infractor_id}`).emit('incidencia:estado_cambiado', data);
    
    // Notificar a moderadores
    this.server.to('moderadores').emit('incidencia:estado_cambiado', data);
    
    // Notificar al arquitecto si la incidencia está en su proyecto
    if (arquitecto_id) {
      this.logger.log(`   [BROADCAST]  Notificando cambio de estado al arquitecto: ${arquitecto_id}`);
      this.server.to(`arquitecto:${arquitecto_id}`).emit('incidencia:estado_cambiado', data);
    }
    
    // Notificar a la sala del proyecto
    if (proyecto_id) {
      this.server.to(`proyecto:${proyecto_id}`).emit('incidencia:estado_cambiado', data);
    }
  }

  /**
   * Emitir evento de incidencia asignada a moderador
   */
  emitIncidenciaAsignada(
    moderador_id: string,
    incidencia: any,
  ) {
    this.logger.log(`[BROADCAST]  Emitiendo incidencia asignada al moderador: ${moderador_id}`);
    this.server.to(`usuario:${moderador_id}`).emit('incidencia:asignada', incidencia);
    this.server.to('moderadores').emit('incidencia:asignada', incidencia);
  }

  /**
   * Emitir evento de incidencia resuelta
   */
  emitIncidenciaResuelta(
    incidencia_id: string,
    usuario_emisor_id: string,
    usuario_infractor_id: string,
    incidencia: any,
    arquitecto_id?: string,
    proyecto_id?: string,
  ) {
    this.logger.log(`[BROADCAST]  Emitiendo incidencia resuelta: ${incidencia_id}`);
    
    this.server.to(`incidencia:${incidencia_id}`).emit('incidencia:resuelta', incidencia);
    this.server.to(`usuario:${usuario_emisor_id}`).emit('incidencia:resuelta', incidencia);
    this.server.to(`usuario:${usuario_infractor_id}`).emit('incidencia:resuelta', incidencia);
    this.server.to('moderadores').emit('incidencia:resuelta', incidencia);
    
    // Notificar al arquitecto si la incidencia está en su proyecto
    if (arquitecto_id) {
      this.logger.log(`   [BROADCAST]  Notificando resolución al arquitecto: ${arquitecto_id}`);
      this.server.to(`arquitecto:${arquitecto_id}`).emit('incidencia:resuelta', incidencia);
    }
    
    // Notificar a la sala del proyecto
    if (proyecto_id) {
      this.server.to(`proyecto:${proyecto_id}`).emit('incidencia:resuelta', incidencia);
    }
  }
}

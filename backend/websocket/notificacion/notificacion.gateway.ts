import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificacionService } from './notificacion.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/notificacion',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingInterval: 25000,
  pingTimeout: 60000,
})
export class NotificacionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificacionGateway.name);
  private userSockets: Map<string, Set<string>> = new Map(); // usuario_id -> Set de socket IDs

  constructor(private readonly notificacionService: NotificacionService) {
    this.logger.log('NotificacionGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', { status: 'ok' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remover el socket de todos los usuarios registrados
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        this.logger.log(`Usuario ${userId} desconectado (socket ${client.id})`);
      }
    }
  }

  @SubscribeMessage('register_user')
  handleRegisterUser(
    @MessageBody() data: { usuario_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data || !data.usuario_id) {
      this.logger.warn('register_user sin usuario_id');
      return { success: false };
    }

    const userId = String(data.usuario_id);
    
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.add(client.id);
      this.logger.log(`[SUCCESS]  Usuario ${userId} registrado con socket ${client.id}`);
      this.logger.log(`   Total sockets para este usuario: ${sockets.size}`);
    }
    
    return { success: true, usuario_id: userId };
  }

  /**
   * Emitir un evento a un usuario específico (todos sus sockets)
   */
  emitToUser(userId: string, event: string, data: any) {
    const userIdStr = String(userId);
    const sockets = this.userSockets.get(userIdStr);
    
    if (!sockets || sockets.size === 0) {
      this.logger.warn(`[WARN]  Usuario ${userIdStr} no tiene sockets conectados`);
      return;
    }

    let emitidos = 0;
    for (const socketId of sockets) {
      this.server.to(socketId).emit(event, data);
      emitidos++;
    }
    
    this.logger.log(`[SUCCESS]  Evento "${event}" emitido a ${emitidos} socket(s) del usuario ${userIdStr}`);
  }

  /**
   * Emitir un evento a todos los clientes conectados
   */
  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.log(`[BROADCAST]  Evento "${event}" emitido a todos los clientes`);
  }
}

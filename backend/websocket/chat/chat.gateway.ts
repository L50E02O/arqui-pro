import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
  transports: ['websocket', 'polling']
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  constructor(private readonly chatService: ChatService) {
    console.log('ChatGateway initialized');
  }

  // Método que será llamado desde el controlador de Rails
  @SubscribeMessage('nuevaConversacion')
  notificarNuevaConversacion(
    @MessageBody() data: { conversacion: any; participante_ids: string[] }
  ) {
    // Notificar a todos los participantes de la conversación
    data.participante_ids.forEach((participanteId: string) => {
      this.server.to(`usuario_${participanteId}`).emit('nuevaConversacion', data.conversacion);
    });
    return { success: true };
  }

  handleConnection(client: Socket) {
    console.log('Chat client connected', client.id);
    client.emit('connection:established', { status: 'ok' });
  }

  handleDisconnect(client: Socket) {
    console.log('Chat client disconnected', client.id);
  }

  @SubscribeMessage('join_conversation')
  handleJoin(@MessageBody() data: { conversacion_id: string }, @ConnectedSocket() client: Socket) {
    if (!data || !data.conversacion_id) {
      console.error('[ERROR]  conversacion_id no proporcionado');
      return;
    }
    
    // [TOOL]  FIX CRÍTICO: Salir de TODAS las conversaciones anteriores
    const currentRooms = Array.from(client.rooms);
    for (const room of currentRooms) {
      if (room.startsWith('conversacion:') && room !== `conversacion:${data.conversacion_id}`) {
        client.leave(room);
        console.log(`[ROOM]  Cliente ${client.id} salió de ${room}`);
      }
    }
    
    const room = `conversacion:${data.conversacion_id}`;
    client.join(room);
    console.log(`Client ${client.id} joined room ${room} in /chat namespace`);
    
    // Verificar que el servidor esté inicializado antes de acceder a rooms
    if (this.server && this.server.sockets && this.server.sockets.adapter && this.server.sockets.adapter.rooms) {
      const roomSize = this.server.sockets.adapter.rooms.get(room)?.size || 0;
      console.log(`Room ${room} now has ${roomSize} clients`);
    }
    
    client.emit('conversation:joined', { conversacion_id: data.conversacion_id });
  }

  @SubscribeMessage('leave_conversation')
  handleLeave(@MessageBody() data: { conversacion_id: string }, @ConnectedSocket() client: Socket) {
    const room = `conversacion:${data.conversacion_id}`;
    client.leave(room);
    client.emit('conversation:left', { conversacion_id: data.conversacion_id });
  }

  @SubscribeMessage('message:create')
  async handleMessageCreate(@MessageBody() payload: { 
    contenido: string; 
    remitente_id: string; 
    conversacion_id: string 
  }, @ConnectedSocket() client: Socket) {
    console.log('[SEND]  Recibido message:create:', payload);
    
    // Validar payload
    if (!payload || !payload.contenido || !payload.remitente_id || !payload.conversacion_id) {
      console.error('[ERROR]  Payload inválido:', payload);
      client.emit('error', { message: 'Invalid payload' });
      return { status: 'error', error: 'Invalid payload' };
    }

    // Obtener token del cliente
    const tokenHeader = (client.handshake.headers['authorization'] as string) || 
                       (client.handshake.auth && (client.handshake.auth as any).token) || '';
    console.log('[KEY]  Token header:', tokenHeader ? 'Presente' : 'Ausente');
    
    try {
      const created = await this.chatService.createMessage(payload, tokenHeader);
      console.log('[SUCCESS]  Mensaje creado exitosamente:', created);
      
      const room = `conversacion:${payload.conversacion_id}`;
      
      // Verificar que el servidor esté inicializado
      if (!this.server || !this.server.sockets || !this.server.sockets.adapter) {
        console.error('[ERROR]  Servidor no inicializado correctamente');
        client.emit('message:new', created); // Al menos enviar al cliente actual
        return { status: 'ok', mensaje: created };
      }
      
      const roomSize = this.server.sockets.adapter.rooms?.get(room)?.size || 0;
      console.log(`[BROADCAST]  Emitiendo message:new a room ${room} con ${roomSize} clientes`);
      console.log(`[BATCH]  Datos del mensaje:`, JSON.stringify(created, null, 2));
      this.server.to(room).emit('message:new', created);
      return { status: 'ok', mensaje: created };
    } catch (err: any) {
      console.error('[ERROR]  Error al crear mensaje:', err);
      console.error('[ERROR]  Detalles del error:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        statusText: err?.response?.statusText
      });
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'could_not_create_message';
      client.emit('error', { 
        message: errorMessage,
        details: err?.response?.data,
        status: err?.response?.status
      });
      return { status: 'error', error: errorMessage };
    }
  }

  @SubscribeMessage('message:typing')
  handleTyping(@MessageBody() payload: { 
    usuario_id: string; 
    conversacion_id: string; 
    typing: boolean 
  }, @ConnectedSocket() client: Socket) {
    const room = `conversacion:${payload.conversacion_id}`;
    this.server.to(room).emit('message:typing', payload);
  }
}

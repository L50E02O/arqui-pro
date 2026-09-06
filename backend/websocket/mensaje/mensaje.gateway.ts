import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MensajeService } from './mensaje.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@WebSocketGateway({
  namespace: '/mensajes',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
})
export class MensajeGateway {
  @WebSocketServer() server: Server;

  constructor(
    private readonly mensajeService: MensajeService,
    private readonly httpService: HttpService,
  ) {}

  @SubscribeMessage('message:create')
  async handleEnviarMensaje(
    @MessageBody()
    payload: {
      contenido: string;
      emisor_id: string;
      conversacion_id: string;
      tipo: string;
      imagenes?: string[];
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log(`\n[SEND]  [MESSAGE:CREATE] Cliente ${client.id} envía mensaje a conversacion:${payload.conversacion_id}`);
      
      // Obtener token de autenticación del cliente
      const tokenHeader = (client.handshake.headers['authorization'] as string) || 
                         (client.handshake.auth && (client.handshake.auth as any).token) || 
                         '';
      
      const mensajeCreado = await this.mensajeService.crearMensaje(payload, tokenHeader);
      
      console.log(`[MSG]  [MESSAGE:NEW] Emitiendo mensaje ${mensajeCreado.id} a room conversacion:${payload.conversacion_id}`);
      
      // Emitir el mensaje a todos los clientes en la sala de la conversación
      this.server
        .to(`conversacion:${payload.conversacion_id}`)
        .emit('message:new', mensajeCreado);

      // Enviar notificación al namespace de notificaciones
      try {
        await firstValueFrom(
          this.httpService.post('http://localhost:3006/api/notificaciones/emit', {
            evento: 'message:new',
            data: mensajeCreado,
          })
        );
        console.log(`[NOTIF]  [NOTIFICATION] Notificación de mensaje enviada`);
      } catch (notifError) {
        console.warn(`[WARN]  [NOTIFICATION] No se pudo enviar notificación:`, notifError.message);
      }

      return { status: 'ok', mensaje: mensajeCreado };
    } catch (error: any) {
      client.emit('error', { message: error.message || 'could_not_create_message' });
      return { status: 'error' };
    }
  }

  @SubscribeMessage('join_conversation')
  async handleUnirseAConversacion(
    @MessageBody() data: { conversacion_id: string } | string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Manejar tanto objeto como string para compatibilidad
      const conversacionId = typeof data === 'string' ? data : data.conversacion_id;
      
      console.log(`\n[STATUS]  [JOIN] Cliente ${client.id} quiere unirse a conversacion:${conversacionId}`);
      
      // [TOOL]  FIX CRÍTICO: Salir de TODAS las conversaciones anteriores
      const currentRooms = Array.from(client.rooms);
      console.log(`[LIST]  [JOIN] Rooms actuales del cliente:`, currentRooms);
      
      for (const room of currentRooms) {
        if (room.startsWith('conversacion:') && room !== `conversacion:${conversacionId}`) {
          await client.leave(room);
          console.log(`[ROOM]  [LEAVE] Cliente ${client.id} salió de ${room}`);
        }
      }
      
      // Unirse a la sala de la conversación
      await client.join(`conversacion:${conversacionId}`);
      
      // Obtener token de autenticación
      const tokenHeader = (client.handshake.headers['authorization'] as string) || 
                         (client.handshake.auth && (client.handshake.auth as any).token) || 
                         '';
      
      // Obtener mensajes anteriores
      const mensajes = await this.mensajeService.obtenerMensajesPorConversacion(
        conversacionId,
        tokenHeader
      );
      
      client.emit('conversation:joined', { conversacion_id: conversacionId, mensajes });
      return { success: true, mensajes };
    } catch (error: any) {
      client.emit('error', { message: error.message || 'could_not_join_conversation' });
      return { status: 'error' };
    }
  }

  @SubscribeMessage('leave_conversation')
  async handleDejarConversacion(
    @MessageBody() conversacionId: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await client.leave(`conversacion:${conversacionId}`);
      client.emit('conversation:left', { conversacion_id: conversacionId });
      return { success: true };
    } catch (error) {
      client.emit('error', { message: error.message || 'could_not_create_message' });
      return { status: 'error' };
    }
  }

  @SubscribeMessage('messages:mark_read')
  async handleMarcarComoLeidos(
    @MessageBody()
    payload: {
      conversacion_id: string;
      usuario_id: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Obtener token de autenticación
      const tokenHeader = (client.handshake.headers['authorization'] as string) || 
                         (client.handshake.auth && (client.handshake.auth as any).token) || 
                         '';
      
      const resultado = await this.mensajeService.marcarMensajesComoLeidos(
        payload.conversacion_id,
        payload.usuario_id,
        tokenHeader
      );
      
      // Notificar a todos en la conversación que los mensajes fueron leídos
      this.server
        .to(`conversacion:${payload.conversacion_id}`)
        .emit('messages:read', {
          conversacion_id: payload.conversacion_id,
          usuario_id: payload.usuario_id,
        });

      return { status: 'ok', resultado };
    } catch (error: any) {
      client.emit('error', { message: error.message || 'could_not_mark_read' });
      return { status: 'error' };
    }
  }
}
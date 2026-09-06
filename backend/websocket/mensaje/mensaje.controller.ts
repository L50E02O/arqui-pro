import { Controller, Post, Body, Logger } from '@nestjs/common';
import { MensajeGateway } from './mensaje.gateway';
import { ChatGateway } from '../chat/chat.gateway';

@Controller('mensajes')
export class MensajeController {
  private readonly logger = new Logger(MensajeController.name);

  constructor(
    private readonly mensajeGateway: MensajeGateway,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('nuevoMensaje')
  async handleNuevoMensaje(@Body() payload: { mensaje: any; conversacion_id: string }) {
    this.logger.log('Received new message notification from Rails API');
    this.logger.log(`Payload: ${JSON.stringify(payload)}`);
    
    try {
      const room = `conversacion:${payload.conversacion_id}`;
      
      // Obtener información de las salas antes de emitir
      const mensajesRoom = this.mensajeGateway.server.sockets.adapter.rooms.get(room);
      const chatRoom = this.chatGateway.server.sockets.adapter.rooms.get(room);
      
      this.logger.log(`Room ${room} - /mensajes namespace: ${mensajesRoom?.size || 0} clients`);
      this.logger.log(`Room ${room} - /chat namespace: ${chatRoom?.size || 0} clients`);
      
      // Emitir el mensaje en el namespace /mensajes
      this.mensajeGateway.server
        .to(room)
        .emit('message:new', payload.mensaje);

      // También emitir en el namespace /chat (donde está conectado el frontend)
      this.chatGateway.server
        .to(room)
        .emit('message:new', payload.mensaje);

      this.logger.log(`Message emitted to room: ${room} in both /mensajes and /chat namespaces`);
      this.logger.log(`Message data: ${JSON.stringify(payload.mensaje)}`);
      return { success: true, message: 'Mensaje emitido correctamente' };
    } catch (error) {
      this.logger.error(`Error emitting message: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

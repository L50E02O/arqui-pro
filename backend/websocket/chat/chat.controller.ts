import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatGateway: ChatGateway) {}

  @Post('nuevaConversacion')
  async nuevaConversacion(
    @Body() data: { conversacion: any; participante_ids: string[] }
  ) {
    this.logger.log('[INBOX]  Recibida notificación de nueva conversación desde Rails');
    this.logger.log(`Participantes: ${data.participante_ids?.join(', ')}`);
    
    // Emitir evento a través del gateway
    if (data.participante_ids && Array.isArray(data.participante_ids)) {
      data.participante_ids.forEach((participanteId: string) => {
        this.chatGateway.server.to(`usuario_${participanteId}`).emit('nuevaConversacion', data.conversacion);
        this.logger.log(`[SUCCESS]  Notificación enviada a usuario_${participanteId}`);
      });
    }
    
    // También emitir globalmente para que todos los clientes conectados se actualicen
    this.chatGateway.server.emit('conversacionCreada', data.conversacion);
    
    return { success: true, message: 'Notificación enviada' };
  }
}

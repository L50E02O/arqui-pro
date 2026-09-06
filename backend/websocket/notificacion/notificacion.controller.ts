import { Controller, Post, Body, Logger } from '@nestjs/common';
import { NotificacionGateway } from './notificacion.gateway';

@Controller('api/notificaciones')
export class NotificacionController {
  private readonly logger = new Logger(NotificacionController.name);

  constructor(private readonly notificacionGateway: NotificacionGateway) {}

  @Post('emit')
  async emitirNotificacion(@Body() payload: {
    event?: string;
    evento?: string;
    data: any;
    usuario_id?: string;
  }) {
    const evento = payload.event || payload.evento;
    
    if (!evento) {
      this.logger.error('[ERROR]  No se proporcionó un evento');
      return { 
        status: 'error', 
        message: 'El campo "event" o "evento" es requerido' 
      };
    }
    
    this.logger.log(`[BROADCAST]  Recibido evento desde Rails: ${evento}`);
    this.logger.log(`   Usuario ID: ${payload.usuario_id || 'todos'}`);
    
    try {
      if (payload.usuario_id) {
        // Emitir a un usuario específico
        this.notificacionGateway.emitToUser(payload.usuario_id, evento, payload.data);
        this.logger.log(`[SUCCESS]  Evento ${evento} emitido a usuario ${payload.usuario_id}`);
      } else {
        // Emitir a todos los clientes conectados
        this.notificacionGateway.server.emit(evento, payload.data);
        this.logger.log(`[SUCCESS]  Evento ${evento} emitido a todos los clientes`);
      }
      
      return { 
        status: 'success', 
        message: `Evento ${evento} emitido correctamente`,
        evento: evento
      };
    } catch (error) {
      this.logger.error(`[ERROR]  Error emitiendo evento: ${error.message}`);
      return { 
        status: 'error', 
        message: error.message 
      };
    }
  }
}

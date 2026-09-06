import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AvancesGateway } from './avances.gateway';

@Controller('api/avances')
export class AvancesController {
  private readonly logger = new Logger(AvancesController.name);

  constructor(private readonly avancesGateway: AvancesGateway) {}

  /**
   * Endpoint para que Rails notifique la creación de un nuevo avance
   */
  @Post('emit/nuevo')
  async handleNuevoAvance(@Body() payload: {
    proyecto_id: string;
    arquitecto_id: string;
    cliente_id?: string;
    avance: any;
  }) {
    this.logger.log(`[BROADCAST]  Recibido nuevo avance desde Rails API`);
    this.logger.log(`   Proyecto ID: ${payload.proyecto_id}`);
    this.logger.log(`   Avance ID: ${payload.avance?.id}`);
    
    try {
      this.avancesGateway.emitNuevoAvance(
        payload.proyecto_id,
        payload.arquitecto_id,
        payload.cliente_id || null,
        payload.avance,
      );
      
      return {
        status: 'success',
        message: 'Evento de nuevo avance emitido correctamente',
      };
    } catch (error) {
      this.logger.error(`[ERROR]  Error al emitir nuevo avance: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Endpoint para que Rails notifique la actualización de un avance
   */
  @Post('emit/actualizado')
  async handleAvanceActualizado(@Body() payload: {
    proyecto_id: string;
    avance: any;
  }) {
    this.logger.log(`[BROADCAST]  Recibido avance actualizado desde Rails API`);
    this.logger.log(`   Proyecto ID: ${payload.proyecto_id}`);
    this.logger.log(`   Avance ID: ${payload.avance?.id}`);
    
    try {
      this.avancesGateway.emitAvanceActualizado(payload.proyecto_id, payload.avance);
      
      return {
        status: 'success',
        message: 'Evento de avance actualizado emitido correctamente',
      };
    } catch (error) {
      this.logger.error(`[ERROR]  Error al emitir avance actualizado: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Endpoint para que Rails notifique la eliminación de un avance
   */
  @Post('emit/eliminado')
  async handleAvanceEliminado(@Body() payload: {
    proyecto_id: string;
    avance_id: string;
  }) {
    this.logger.log(`[BROADCAST]  Recibido avance eliminado desde Rails API`);
    this.logger.log(`   Proyecto ID: ${payload.proyecto_id}`);
    this.logger.log(`   Avance ID: ${payload.avance_id}`);
    
    try {
      this.avancesGateway.emitAvanceEliminado(payload.proyecto_id, payload.avance_id);
      
      return {
        status: 'success',
        message: 'Evento de avance eliminado emitido correctamente',
      };
    } catch (error) {
      this.logger.error(`[ERROR]  Error al emitir avance eliminado: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}

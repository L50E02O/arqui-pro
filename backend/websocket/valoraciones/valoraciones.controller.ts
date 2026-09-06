import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ValoracionesGateway } from './valoraciones.gateway';

@Controller('api/valoraciones')
export class ValoracionesController {
  private readonly logger = new Logger(ValoracionesController.name);

  constructor(private readonly valoracionesGateway: ValoracionesGateway) {}

  /**
   * Endpoint para que Rails notifique una nueva valoración
   */
  @Post('emit/nueva')
  async handleNuevaValoracion(@Body() payload: {
    proyecto_id: string;
    arquitecto_id: string;
    cliente_id: string;
    valoracion: any;
  }) {
    this.logger.log(`[BROADCAST]  Recibida nueva valoración desde Rails API`);
    this.logger.log(`   Proyecto ID: ${payload.proyecto_id}`);
    this.logger.log(`   Arquitecto ID: ${payload.arquitecto_id}`);
    this.logger.log(`   Calificación: ${payload.valoracion?.calificacion}`);
    
    try {
      this.valoracionesGateway.emitNuevaValoracion(
        payload.proyecto_id,
        payload.arquitecto_id,
        payload.cliente_id,
        payload.valoracion,
      );
      
      return {
        status: 'success',
        message: 'Evento de nueva valoración emitido correctamente',
      };
    } catch (error) {
      this.logger.error(`[ERROR]  Error al emitir nueva valoración: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Endpoint para que Rails notifique la actualización del promedio de valoraciones del arquitecto
   */
  @Post('emit/promedio')
  async handlePromedioActualizado(@Body() payload: {
    arquitecto_id: string;
    valoracion_promedio: number;
    total_valoraciones: number;
  }) {
    this.logger.log(`[BROADCAST]  Recibida actualización de promedio desde Rails API`);
    this.logger.log(`   Arquitecto ID: ${payload.arquitecto_id}`);
    this.logger.log(`   Nuevo promedio: ${payload.valoracion_promedio}`);
    
    try {
      this.valoracionesGateway.emitValoracionPromedioActualizada(
        payload.arquitecto_id,
        {
          valoracion_promedio: payload.valoracion_promedio,
          total_valoraciones: payload.total_valoraciones,
        },
      );
      
      return {
        status: 'success',
        message: 'Evento de promedio actualizado emitido correctamente',
      };
    } catch (error) {
      this.logger.error(`[ERROR]  Error al emitir promedio actualizado: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Endpoint para que Rails notifique la actualización de una valoración
   */
  @Post('emit/actualizada')
  async handleValoracionActualizada(@Body() payload: {
    proyecto_id: string;
    arquitecto_id: string;
    valoracion: any;
  }) {
    this.logger.log(`[BROADCAST]  Recibida valoración actualizada desde Rails API`);
    this.logger.log(`   Valoración ID: ${payload.valoracion?.id}`);
    
    try {
      this.valoracionesGateway.emitValoracionActualizada(
        payload.proyecto_id,
        payload.arquitecto_id,
        payload.valoracion,
      );
      
      return {
        status: 'success',
        message: 'Evento de valoración actualizada emitido correctamente',
      };
    } catch (error) {
      this.logger.error(`[ERROR]  Error al emitir valoración actualizada: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Endpoint para que Rails notifique la eliminación de una valoración
   */
  @Post('emit/eliminada')
  async handleValoracionEliminada(@Body() payload: {
    proyecto_id: string;
    arquitecto_id: string;
    valoracion_id: string;
  }) {
    this.logger.log(`[BROADCAST]  Recibida valoración eliminada desde Rails API`);
    this.logger.log(`   Valoración ID: ${payload.valoracion_id}`);
    
    try {
      this.valoracionesGateway.emitValoracionEliminada(
        payload.proyecto_id,
        payload.arquitecto_id,
        payload.valoracion_id,
      );
      
      return {
        status: 'success',
        message: 'Evento de valoración eliminada emitido correctamente',
      };
    } catch (error) {
      this.logger.error(`[ERROR]  Error al emitir valoración eliminada: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}

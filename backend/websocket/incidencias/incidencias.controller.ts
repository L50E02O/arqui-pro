import { Controller, Post, Body, Logger } from '@nestjs/common';
import { IncidenciasGateway } from './incidencias.gateway';

@Controller('api/incidencias')
export class IncidenciasController {
  private readonly logger = new Logger(IncidenciasController.name);

  constructor(private readonly incidenciasGateway: IncidenciasGateway) {}

  /**
   * Endpoint para que Rails notifique la creación de una nueva incidencia
   */
  @Post('emit/nueva')
  async handleNuevaIncidencia(@Body() payload: {
    usuario_emisor_id: string;
    usuario_infractor_id: string;
    incidencia: any;
  }) {
    this.logger.log(`[BROADCAST]  Recibida nueva incidencia desde Rails API`);
    this.logger.log(`   Incidencia ID: ${payload.incidencia?.id}`);
    this.logger.log(`   Emisor: ${payload.usuario_emisor_id}`);
    this.logger.log(`   Infractor: ${payload.usuario_infractor_id}`);
    
    try {
      this.incidenciasGateway.emitNuevaIncidencia(
        payload.usuario_emisor_id,
        payload.usuario_infractor_id,
        payload.incidencia,
      );
      
      return {
        status: 'success',
        message: 'Evento de nueva incidencia emitido correctamente',
      };
    } catch (error) {
      this.logger.error(`[ERROR]  Error al emitir nueva incidencia: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Endpoint para que Rails notifique el cambio de estado de una incidencia
   */
  @Post('emit/estado')
  async handleEstadoCambiado(@Body() payload: {
    incidencia_id: string;
    usuario_emisor_id: string;
    usuario_infractor_id: string;
    estado_anterior: string;
    estado_nuevo: string;
    incidencia: any;
  }) {
    this.logger.log(`[BROADCAST]  Recibido cambio de estado de incidencia desde Rails API`);
    this.logger.log(`   Incidencia ID: ${payload.incidencia_id}`);
    this.logger.log(`   Estado: ${payload.estado_anterior} → ${payload.estado_nuevo}`);
    
    try {
      this.incidenciasGateway.emitIncidenciaEstadoCambiado(
        payload.incidencia_id,
        payload.usuario_emisor_id,
        payload.usuario_infractor_id,
        {
          incidencia_id: payload.incidencia_id,
          estado_anterior: payload.estado_anterior,
          estado_nuevo: payload.estado_nuevo,
          incidencia: payload.incidencia,
        },
      );
      
      return {
        status: 'success',
        message: 'Evento de cambio de estado emitido correctamente',
      };
    } catch (error) {
      this.logger.error(`[ERROR]  Error al emitir cambio de estado: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Endpoint para que Rails notifique la asignación de incidencia a moderador
   */
  @Post('emit/asignada')
  async handleIncidenciaAsignada(@Body() payload: {
    moderador_id: string;
    incidencia: any;
  }) {
    this.logger.log(`[BROADCAST]  Recibida incidencia asignada desde Rails API`);
    this.logger.log(`   Moderador ID: ${payload.moderador_id}`);
    this.logger.log(`   Incidencia ID: ${payload.incidencia?.id}`);
    
    try {
      this.incidenciasGateway.emitIncidenciaAsignada(
        payload.moderador_id,
        payload.incidencia,
      );
      
      return {
        status: 'success',
        message: 'Evento de incidencia asignada emitido correctamente',
      };
    } catch (error) {
      this.logger.error(`[ERROR]  Error al emitir incidencia asignada: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Endpoint para que Rails notifique que una incidencia fue resuelta
   */
  @Post('emit/resuelta')
  async handleIncidenciaResuelta(@Body() payload: {
    incidencia_id: string;
    usuario_emisor_id: string;
    usuario_infractor_id: string;
    incidencia: any;
  }) {
    this.logger.log(`[BROADCAST]  Recibida incidencia resuelta desde Rails API`);
    this.logger.log(`   Incidencia ID: ${payload.incidencia_id}`);
    
    try {
      this.incidenciasGateway.emitIncidenciaResuelta(
        payload.incidencia_id,
        payload.usuario_emisor_id,
        payload.usuario_infractor_id,
        payload.incidencia,
      );
      
      return {
        status: 'success',
        message: 'Evento de incidencia resuelta emitido correctamente',
      };
    } catch (error) {
      this.logger.error(`[ERROR]  Error al emitir incidencia resuelta: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}

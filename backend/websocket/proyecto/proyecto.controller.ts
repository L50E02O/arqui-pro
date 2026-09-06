import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ProyectoGateway } from './proyecto.gateway';

@Controller('api/proyectos')
export class ProyectoController {
  private readonly logger = new Logger(ProyectoController.name);

  constructor(private readonly proyectoGateway: ProyectoGateway) {}

  /**
   * Endpoint para que Rails notifique la creación de un nuevo proyecto
   */
  @Post('emit/nuevo')
  async handleNuevoProyecto(@Body() payload: {
    arquitecto_id: string;
    proyecto: any;
  }) {
    this.logger.log(`[BROADCAST]  Recibido nuevo proyecto desde Rails API`);
    this.logger.log(`   Arquitecto ID: ${payload.arquitecto_id}`);
    this.logger.log(`   Proyecto ID: ${payload.proyecto?.id}`);
    
    try {
      this.proyectoGateway.emitNuevoProyecto(payload.arquitecto_id, payload.proyecto);
      
      return {
        status: 'success',
        message: 'Evento de nuevo proyecto emitido correctamente',
      };
    } catch (error) {
      this.logger.error(`[ERROR]  Error al emitir nuevo proyecto: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Endpoint para que Rails notifique la actualización de un proyecto
   */
  @Post('emit/actualizado')
  async handleProyectoActualizado(@Body() payload: {
    proyecto_id: string;
    arquitecto_id: string;
    proyecto: any;
  }) {
    this.logger.log(`[BROADCAST]  Recibido proyecto actualizado desde Rails API`);
    this.logger.log(`   Proyecto ID: ${payload.proyecto_id}`);
    
    try {
      this.proyectoGateway.emitProyectoActualizado(
        payload.proyecto_id,
        payload.arquitecto_id,
        payload.proyecto,
      );
      
      return {
        status: 'success',
        message: 'Evento de proyecto actualizado emitido correctamente',
      };
    } catch (error) {
      this.logger.error(`[ERROR]  Error al emitir proyecto actualizado: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Endpoint para que Rails notifique el cambio de estado de un proyecto
   */
  @Post('emit/estado')
  async handleEstadoCambiado(@Body() payload: {
    proyecto_id: string;
    arquitecto_id: string;
    cliente_id?: string;
    estado_anterior: string;
    estado_nuevo: string;
    proyecto: any;
  }) {
    this.logger.log(`[BROADCAST]  Recibido cambio de estado de proyecto desde Rails API`);
    this.logger.log(`   Proyecto ID: ${payload.proyecto_id}`);
    this.logger.log(`   Estado: ${payload.estado_anterior} → ${payload.estado_nuevo}`);
    
    try {
      this.proyectoGateway.emitProyectoEstadoCambiado(
        payload.proyecto_id,
        payload.arquitecto_id,
        payload.cliente_id || null,
        {
          proyecto_id: payload.proyecto_id,
          estado_anterior: payload.estado_anterior,
          estado_nuevo: payload.estado_nuevo,
          proyecto: payload.proyecto,
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
   * Endpoint para que Rails notifique la asignación de proyecto a un cliente
   */
  @Post('emit/asignado')
  async handleProyectoAsignado(@Body() payload: {
    cliente_id: string;
    proyecto: any;
  }) {
    this.logger.log(`[BROADCAST]  Recibido proyecto asignado desde Rails API`);
    this.logger.log(`   Cliente ID: ${payload.cliente_id}`);
    this.logger.log(`   Proyecto ID: ${payload.proyecto?.id}`);
    
    try {
      this.proyectoGateway.emitProyectoAsignado(payload.cliente_id, payload.proyecto);
      
      return {
        status: 'success',
        message: 'Evento de proyecto asignado emitido correctamente',
      };
    } catch (error) {
      this.logger.error(`[ERROR]  Error al emitir proyecto asignado: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}

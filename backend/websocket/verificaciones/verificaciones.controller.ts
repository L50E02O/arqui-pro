import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { VerificacionesGateway } from './verificaciones.gateway';

@Controller('api/verificaciones')
export class VerificacionesController {
  constructor(private readonly verificacionesGateway: VerificacionesGateway) {}

  @Post('emit/aprobada')
  @HttpCode(HttpStatus.OK)
  async emitVerificacionAprobada(@Body() body: any) {
    try {
      this.verificacionesGateway.emitArquitectoVerificado({
        arquitecto_id: body.arquitecto_id,
        verificacion_id: body.verificacion_id,
        moderador_id: body.moderador_id,
        fecha_verificacion: body.fecha_verificacion,
      });
      return { status: 'ok', message: 'Evento emitido correctamente' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Post('emit/rechazada')
  @HttpCode(HttpStatus.OK)
  async emitVerificacionRechazada(@Body() body: any) {
    try {
      this.verificacionesGateway.emitArquitectoRechazado({
        arquitecto_id: body.arquitecto_id,
        verificacion_id: body.verificacion_id,
        moderador_id: body.moderador_id,
        motivo_rechazo: body.motivo_rechazo,
      });
      return { status: 'ok', message: 'Evento emitido correctamente' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Post('emit/nueva-solicitud')
  @HttpCode(HttpStatus.OK)
  async emitNuevaSolicitud(@Body() body: any) {
    try {
      this.verificacionesGateway.emitNuevaSolicitudVerificacion({
        arquitecto_id: body.arquitecto_id,
        verificacion_id: body.verificacion_id,
        fecha_solicitud: body.fecha_solicitud,
      });
      return { status: 'ok', message: 'Evento emitido correctamente' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

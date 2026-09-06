import { Module } from '@nestjs/common';
import { VerificacionesGateway } from './verificaciones.gateway';
import { VerificacionesController } from './verificaciones.controller';

@Module({
  controllers: [VerificacionesController],
  providers: [VerificacionesGateway],
  exports: [VerificacionesGateway],
})
export class VerificacionesModule {}

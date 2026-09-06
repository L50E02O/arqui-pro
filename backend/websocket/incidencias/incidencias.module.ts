import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IncidenciasService } from './incidencias.service';
import { IncidenciasGateway } from './incidencias.gateway';
import { IncidenciasController } from './incidencias.controller';

@Module({
  imports: [HttpModule],
  controllers: [IncidenciasController],
  providers: [IncidenciasGateway, IncidenciasService],
  exports: [IncidenciasGateway],
})
export class IncidenciasModule {}

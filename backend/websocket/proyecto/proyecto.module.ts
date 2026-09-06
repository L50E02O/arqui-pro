import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProyectoService } from './proyecto.service';
import { ProyectoGateway } from './proyecto.gateway';
import { ProyectoController } from './proyecto.controller';

@Module({
  imports: [HttpModule],
  controllers: [ProyectoController],
  providers: [ProyectoGateway, ProyectoService],
  exports: [ProyectoGateway],
})
export class ProyectoModule {}

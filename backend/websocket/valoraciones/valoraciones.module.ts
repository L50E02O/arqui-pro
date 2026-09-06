import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ValoracionesService } from './valoraciones.service';
import { ValoracionesGateway } from './valoraciones.gateway';
import { ValoracionesController } from './valoraciones.controller';

@Module({
  imports: [HttpModule],
  controllers: [ValoracionesController],
  providers: [ValoracionesGateway, ValoracionesService],
  exports: [ValoracionesGateway],
})
export class ValoracionesModule {}

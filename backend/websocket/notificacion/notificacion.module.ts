import { Module } from '@nestjs/common';
import { NotificacionService } from './notificacion.service';
import { NotificacionGateway } from './notificacion.gateway';
import { NotificacionController } from './notificacion.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [NotificacionController],
  providers: [NotificacionGateway, NotificacionService],
})
export class NotificacionModule {}

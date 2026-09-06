import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from '../chat/chat.module';
import { NotificacionModule } from '../notificacion/notificacion.module';
import { MensajeModule } from '../mensaje/mensaje.module';
import { ProyectoModule as ProyectosWSModule } from '../proyecto/proyecto.module';
import { AvancesModule as AvancesWSModule } from '../avances/avances.module';
import { IncidenciasModule as IncidenciasWSModule } from '../incidencias/incidencias.module';
import { ValoracionesModule as ValoracionesWSModule } from '../valoraciones/valoraciones.module';
import { VerificacionesModule as VerificacionesWSModule } from '../verificaciones/verificaciones.module';

@Module({
  imports: [
    ChatModule,
    NotificacionModule,
    MensajeModule,
    ProyectosWSModule,
    AvancesWSModule,
    IncidenciasWSModule,
    ValoracionesWSModule,
    VerificacionesWSModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

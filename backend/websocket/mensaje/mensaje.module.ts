import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MensajeGateway } from './mensaje.gateway';
import { MensajeService } from './mensaje.service';
import { MensajeController } from './mensaje.controller';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [HttpModule, forwardRef(() => ChatModule)],
  controllers: [MensajeController],
  providers: [MensajeGateway, MensajeService],
  exports: [MensajeService],
})
export class MensajeModule {}
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AvancesService } from './avances.service';
import { AvancesGateway } from './avances.gateway';
import { AvancesController } from './avances.controller';

@Module({
  imports: [HttpModule],
  controllers: [AvancesController],
  providers: [AvancesGateway, AvancesService],
  exports: [AvancesGateway],
})
export class AvancesModule {}

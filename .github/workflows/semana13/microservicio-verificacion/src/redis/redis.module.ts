import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * Módulo global de Redis
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}


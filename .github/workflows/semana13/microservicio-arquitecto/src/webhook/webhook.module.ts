import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { WebhookService } from './webhook.service';
import { WebhookProcessor } from './webhook.processor';

/**
 * Módulo de Webhook Publisher
 * Configura Bull para manejo de colas de webhooks con retry y DLQ
 */
@Module({
  imports: [
    ConfigModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: 'webhook-delivery',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false, // Mantener fallos para DLQ
      },
    }),
  ],
  providers: [WebhookService, WebhookProcessor],
  exports: [WebhookService],
})
export class WebhookModule {}


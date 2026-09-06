import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookSubscription, WebhookPayload } from './dto/webhook-payload.dto';

/**
 * Procesador de Bull para entregar webhooks
 * Implementa retry con exponential backoff y manejo de DLQ
 */
@Processor('webhook-delivery')
export class WebhookProcessor {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Procesa la entrega de un webhook
   * Se ejecuta automáticamente por Bull con retry configurado
   */
  @Process('deliver-webhook')
  async handleWebhookDelivery(job: Job) {
    const {
      subscription,
      payload,
      signature,
      correlationId,
      attemptNumber,
      retryIntervals,
    } = job.data as {
      subscription: WebhookSubscription;
      payload: WebhookPayload;
      signature: string;
      correlationId: string;
      attemptNumber: number;
      retryIntervals: number[];
    };

    const currentAttempt = job.attemptsMade + 1;

    this.logger.log(
      `Procesando entrega de webhook: ${payload.event} (Intento ${currentAttempt}/${subscription.retry_config.max_attempts})`,
    );

    const result = await this.webhookService.deliverWebhook(
      subscription,
      payload,
      signature,
      correlationId,
      currentAttempt,
    );

    if (!result.success) {
      // Si es el último intento, mover a DLQ
      if (currentAttempt >= subscription.retry_config.max_attempts) {
        await this.webhookService.moveToDLQ(
          subscription,
          payload,
          signature,
          correlationId,
          currentAttempt,
        );
        throw new Error(
          `Webhook falló después de ${currentAttempt} intentos. Movido a DLQ.`,
        );
      }
      
      // Calcular delay para el siguiente intento
      const delayIndex = Math.min(currentAttempt, retryIntervals.length - 1);
      const nextDelay = retryIntervals[delayIndex] * 1000; // Convertir a milisegundos
      
      // Actualizar el delay del job para el siguiente intento
      job.opts.delay = nextDelay;
      
      // Lanzar error para que Bull reintente con el nuevo delay
      throw new Error(`Intento ${currentAttempt} falló: ${result.error}`);
    }

    return result;
  }
}


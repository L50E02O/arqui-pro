import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosInstance } from 'axios';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { WebhookPayload, WebhookSubscription, RetryConfig } from './dto/webhook-payload.dto';

/**
 * Servicio de publicación de webhooks con Fanout y Dead Letter Queue
 * Implementa retry con exponential backoff y firma HMAC-SHA256
 */
@Injectable()
export class WebhookService implements OnModuleInit {
  private readonly logger = new Logger(WebhookService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly supabaseUrl: string;
  private readonly supabaseServiceKey: string;
  private readonly supabaseAnonKey: string;
  private readonly defaultRetryConfig: RetryConfig = {
    max_attempts: 6,
    backoff_intervals: [60, 300, 1800, 7200, 43200], // 1min, 5min, 30min, 2h, 12h
  };

  constructor(
    @InjectQueue('webhook-delivery') private readonly webhookQueue: Queue,
    private readonly configService: ConfigService,
  ) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    this.supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY') || '';
    this.supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY') || this.supabaseServiceKey;

    this.axiosInstance = axios.create({
      timeout: 10000, // 10 segundos
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WebhookPublisher/1.0',
      },
    });
  }

  async onModuleInit() {
    this.logger.log('WebhookService inicializado');
  }

  /**
   * Publica un webhook usando el patrón Fanout
   * Un evento genera múltiples webhooks (uno por suscriptor)
   */
  async publishWebhook(
    eventType: string,
    eventData: Record<string, any>,
    correlationId?: string,
  ): Promise<void> {
    try {
      // Obtener todos los suscriptores activos para este tipo de evento
      const subscriptions = await this.getActiveSubscriptions(eventType);

      if (subscriptions.length === 0) {
        this.logger.warn(`No hay suscriptores activos para el evento: ${eventType}`);
        return;
      }

      this.logger.log(
        `Publicando webhook ${eventType} a ${subscriptions.length} suscriptor(es)`,
      );

      // Fanout: crear un job de webhook para cada suscriptor
      for (const subscription of subscriptions) {
        const payload = this.createWebhookPayload(eventType, eventData, correlationId);
        const signature = this.generateHMACSignature(payload, subscription.secret_key);

        // Agregar job a la cola de Bull con configuración de retry
        // Usamos backoff 'fixed' con delay inicial, el delay real se calcula en el procesador
        await this.webhookQueue.add(
          'deliver-webhook',
          {
            subscription,
            payload,
            signature,
            correlationId: correlationId || uuidv4(),
            attemptNumber: 1,
            retryIntervals: subscription.retry_config.backoff_intervals,
          },
          {
            attempts: subscription.retry_config.max_attempts,
            backoff: {
              type: 'fixed',
              delay: subscription.retry_config.backoff_intervals[0] * 1000, // Primer delay en milisegundos
            },
            removeOnComplete: true,
            removeOnFail: false, // Mantener en DLQ
          },
        );
      }

      this.logger.log(`Webhooks agregados a la cola para evento: ${eventType}`);
    } catch (error) {
      this.logger.error(`Error al publicar webhook ${eventType}:`, error);
      throw error;
    }
  }

  /**
   * Crea el payload estándar del webhook
   */
  private createWebhookPayload(
    eventType: string,
    eventData: Record<string, any>,
    correlationId?: string,
  ): WebhookPayload {
    const eventId = uuidv4();
    const idempotencyKey = this.generateIdempotencyKey(eventType, eventData);

    return {
      event: eventType,
      version: '1.0',
      id: eventId,
      idempotency_key: idempotencyKey,
      timestamp: new Date().toISOString(),
      metadata: {
        correlation_id: correlationId || uuidv4(),
        source: this.configService.get<string>('SERVICE_NAME') || 'microservice',
      },
      data: eventData,
    };
  }

  /**
   * Genera una clave de idempotencia única basada en el tipo de evento y datos
   */
  private generateIdempotencyKey(eventType: string, eventData: Record<string, any>): string {
    // Usar eventType + entity_id (si existe) + timestamp del evento
    const entityId = eventData.id || eventData.arquitecto_id || eventData.verification_id || '';
    const timestamp = eventData.timestamp || new Date().toISOString();
    const key = `${eventType}:${entityId}:${timestamp}`;
    return Buffer.from(key).toString('base64').substring(0, 255);
  }

  /**
   * Genera firma HMAC-SHA256 del payload
   */
  private generateHMACSignature(payload: WebhookPayload, secret: string): string {
    const payloadString = JSON.stringify(payload);
    const hmac = createHmac('sha256', secret);
    hmac.update(payloadString);
    return hmac.digest('hex');
  }

  /**
   * Obtiene suscripciones activas desde Supabase
   */
  private async getActiveSubscriptions(eventType: string): Promise<WebhookSubscription[]> {
    try {
      const response = await this.axiosInstance.get(
        `${this.supabaseUrl}/rest/v1/webhook_subscriptions`,
        {
          params: {
            event_type: `eq.${eventType}`,
            active: 'eq.true',
            select: 'id,event_type,subscriber_url,secret_key,retry_config,active',
          },
          headers: {
            apikey: this.supabaseServiceKey,
            Authorization: `Bearer ${this.supabaseServiceKey}`,
          },
        },
      );

      return (response.data || []).map((sub: any) => ({
        id: sub.id,
        event_type: sub.event_type,
        subscriber_url: sub.subscriber_url,
        secret_key: sub.secret_key,
        retry_config: sub.retry_config || this.defaultRetryConfig,
        active: sub.active,
      }));
    } catch (error) {
      this.logger.error(`Error al obtener suscripciones para ${eventType}:`, error);
      return [];
    }
  }

  /**
   * Procesa la entrega de un webhook (llamado por el worker de Bull)
   */
  async deliverWebhook(
    subscription: WebhookSubscription,
    payload: WebhookPayload,
    signature: string,
    correlationId: string,
    attemptNumber: number,
  ): Promise<{ success: boolean; httpStatusCode?: number; error?: string }> {
    try {
      // Registrar intento de entrega
      await this.logDeliveryAttempt(
        subscription,
        payload,
        signature,
        correlationId,
        attemptNumber,
        'pending',
      );

      // Enviar HTTP POST al suscriptor
      // Si es una Edge Function de Supabase, agregar header de autorización
      const headers: Record<string, string> = {
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Id': payload.id,
        'X-Webhook-Timestamp': payload.timestamp,
        'X-Correlation-Id': correlationId,
      };

      // Agregar autorización para Edge Functions de Supabase
      if (subscription.subscriber_url.includes('supabase.co/functions/v1/')) {
        headers['Authorization'] = `Bearer ${this.supabaseAnonKey}`;
      }

      const response = await this.axiosInstance.post(subscription.subscriber_url, payload, {
        headers,
      });

      // Registrar éxito
      await this.logDeliveryAttempt(
        subscription,
        payload,
        signature,
        correlationId,
        attemptNumber,
        'success',
        response.status,
        JSON.stringify(response.data),
      );

      this.logger.log(
        `Webhook entregado exitosamente: ${payload.event} -> ${subscription.subscriber_url} (Intento ${attemptNumber})`,
      );

      return { success: true, httpStatusCode: response.status };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      const httpStatusCode = error.response?.status;

      // Registrar fallo
      await this.logDeliveryAttempt(
        subscription,
        payload,
        signature,
        correlationId,
        attemptNumber,
        'failed',
        httpStatusCode,
        null,
        errorMessage,
      );

      this.logger.warn(
        `Fallo en entrega de webhook: ${payload.event} -> ${subscription.subscriber_url} (Intento ${attemptNumber}): ${errorMessage}`,
      );

      return { success: false, httpStatusCode, error: errorMessage };
    }
  }

  /**
   * Registra un intento de entrega en la base de datos
   */
  private async logDeliveryAttempt(
    subscription: WebhookSubscription,
    payload: WebhookPayload,
    signature: string,
    correlationId: string,
    attemptNumber: number,
    status: 'pending' | 'success' | 'failed' | 'dlq',
    httpStatusCode?: number,
    responseBody?: string | null,
    errorMessage?: string,
  ): Promise<void> {
    try {
      await this.axiosInstance.post(
        `${this.supabaseUrl}/rest/v1/webhook_deliveries`,
        {
          subscription_id: subscription.id,
          event_type: payload.event,
          subscriber_url: subscription.subscriber_url,
          payload: payload,
          signature: signature,
          attempt_number: attemptNumber,
          status: status,
          http_status_code: httpStatusCode,
          response_body: responseBody,
          error_message: errorMessage,
          correlation_id: correlationId,
          delivered_at: status === 'success' ? new Date().toISOString() : null,
          next_retry_at:
            status === 'failed' && attemptNumber < subscription.retry_config.max_attempts
              ? this.calculateNextRetry(attemptNumber, subscription.retry_config)
              : null,
        },
        {
          headers: {
            apikey: this.supabaseServiceKey,
            Authorization: `Bearer ${this.supabaseServiceKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
        },
      );
    } catch (error) {
      this.logger.error('Error al registrar intento de entrega:', error);
    }
  }

  /**
   * Calcula el siguiente intento de retry
   */
  private calculateNextRetry(attemptNumber: number, retryConfig: RetryConfig): string {
    const intervals = retryConfig.backoff_intervals;
    const delayIndex = Math.min(attemptNumber, intervals.length - 1);
    const delaySeconds = intervals[delayIndex];
    const nextRetry = new Date();
    nextRetry.setSeconds(nextRetry.getSeconds() + delaySeconds);
    return nextRetry.toISOString();
  }

  /**
   * Mueve un webhook fallido a la Dead Letter Queue
   */
  async moveToDLQ(
    subscription: WebhookSubscription,
    payload: WebhookPayload,
    signature: string,
    correlationId: string,
    finalAttempt: number,
  ): Promise<void> {
    try {
      await this.logDeliveryAttempt(
        subscription,
        payload,
        signature,
        correlationId,
        finalAttempt,
        'dlq',
      );

      this.logger.error(
        `Webhook movido a DLQ después de ${finalAttempt} intentos: ${payload.event} -> ${subscription.subscriber_url}`,
      );
    } catch (error) {
      this.logger.error('Error al mover webhook a DLQ:', error);
    }
  }
}


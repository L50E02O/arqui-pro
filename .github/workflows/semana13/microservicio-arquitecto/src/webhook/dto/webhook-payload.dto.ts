/**
 * DTO para el payload estándar de webhook
 * Sigue el formato estándar de la industria
 */
export interface WebhookPayload {
  event: string; // Tipo de evento (ej: 'architect.registered', 'verification.pending')
  version: string; // Versión del formato del webhook
  id: string; // ID único del evento
  idempotency_key: string; // Clave de idempotencia única
  timestamp: string; // ISO 8601 timestamp
  metadata: {
    correlation_id?: string;
    source: string; // Nombre del microservicio
    [key: string]: any;
  };
  data: Record<string, any>; // Datos específicos del evento
}

/**
 * DTO para configuración de retry
 */
export interface RetryConfig {
  max_attempts: number;
  backoff_intervals: number[]; // Intervalos en segundos
}

/**
 * DTO para suscripción de webhook
 */
export interface WebhookSubscription {
  id: string;
  event_type: string;
  subscriber_url: string;
  secret_key: string;
  retry_config: RetryConfig;
  active: boolean;
}


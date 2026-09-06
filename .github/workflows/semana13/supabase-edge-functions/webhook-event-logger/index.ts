import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

interface WebhookPayload {
  event: string;
  version: string;
  id: string;
  idempotency_key: string;
  timestamp: string;
  metadata: {
    correlation_id?: string;
    source: string;
    [key: string]: any;
  };
  data: Record<string, any>;
}

/**
 * Edge Function 1: Webhook Event Logger
 * Valida firma HMAC, verifica timestamp (anti-replay), y guarda evento en webhook_events
 */
Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    console.log(`[${requestId}] [INFO] Webhook Event Logger iniciado`, {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
    });

    // Obtener variables de entorno
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET') || 'default-secret-change-me';

    console.log(`[${requestId}] [DEBUG] Variables de entorno cargadas`, {
      supabaseUrl: supabaseUrl ? '✓' : '✗',
      supabaseServiceKey: supabaseServiceKey ? '✓' : '✗',
      webhookSecret: webhookSecret ? '✓' : '✗',
    });

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log(`[${requestId}] [DEBUG] Cliente Supabase inicializado`);

    // Obtener payload y headers
    const payload: WebhookPayload = await req.json();
    const signature = req.headers.get('X-Webhook-Signature') || '';
    const timestamp = req.headers.get('X-Webhook-Timestamp') || payload.timestamp;
    const correlationId = req.headers.get('X-Correlation-Id') || payload.metadata?.correlation_id || 'unknown';

    console.log(`[${requestId}] [INFO] Webhook recibido`, {
      event: payload.event,
      event_id: payload.id,
      idempotency_key: payload.idempotency_key,
      correlation_id: correlationId,
      timestamp: payload.timestamp,
      source: payload.metadata?.source,
      has_signature: !!signature,
      signature_length: signature.length,
    });

    // 1. Validar firma HMAC
    console.log(`[${requestId}] [DEBUG] Iniciando validación de firma HMAC`);
    const expectedSignature = generateHMACSignature(payload, webhookSecret);
    
    if (signature !== expectedSignature) {
      console.error(`[${requestId}] [ERROR] Firma HMAC inválida`, {
        received: signature.substring(0, 20) + '...',
        expected: expectedSignature.substring(0, 20) + '...',
        received_length: signature.length,
        expected_length: expectedSignature.length,
        match: signature === expectedSignature,
      });
      return new Response(
        JSON.stringify({ 
          error: 'Invalid signature',
          request_id: requestId 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.log(`[${requestId}] [INFO] Firma HMAC válida`);

    // 2. Verificar timestamp (anti-replay attack, máximo 5 minutos)
    console.log(`[${requestId}] [DEBUG] Verificando timestamp`, {
      event_timestamp: timestamp,
      current_time: new Date().toISOString(),
    });
    
    const eventTimestamp = new Date(timestamp);
    const now = new Date();
    const timeDiff = Math.abs(now.getTime() - eventTimestamp.getTime()) / 1000; // en segundos
    const maxAge = 5 * 60; // 5 minutos

    console.log(`[${requestId}] [DEBUG] Cálculo de diferencia de tiempo`, {
      event_timestamp: eventTimestamp.toISOString(),
      current_timestamp: now.toISOString(),
      time_diff_seconds: timeDiff,
      max_age_seconds: maxAge,
      is_valid: timeDiff <= maxAge,
    });

    if (timeDiff > maxAge) {
      console.error(`[${requestId}] [ERROR] Timestamp inválido (muy antiguo o muy futuro)`, {
        time_diff_seconds: timeDiff,
        max_age_seconds: maxAge,
        event_timestamp: eventTimestamp.toISOString(),
        current_timestamp: now.toISOString(),
      });
      return new Response(
        JSON.stringify({ 
          error: 'Timestamp validation failed',
          time_diff_seconds: timeDiff,
          max_age_seconds: maxAge,
          request_id: requestId,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.log(`[${requestId}] [INFO] Timestamp válido (diferencia: ${timeDiff.toFixed(2)}s)`);

    // 3. Verificar idempotencia (deduplicar eventos duplicados)
    console.log(`[${requestId}] [DEBUG] Verificando idempotencia`, {
      idempotency_key: payload.idempotency_key,
    });
    
    const { data: existingEvent, error: idempotencyError } = await supabase
      .from('webhook_events')
      .select('id, event_id, processed_at')
      .eq('idempotency_key', payload.idempotency_key)
      .single();

    if (idempotencyError && idempotencyError.code !== 'PGRST116') {
      console.error(`[${requestId}] [ERROR] Error al verificar idempotencia`, {
        error: idempotencyError.message,
        code: idempotencyError.code,
      });
    }

    if (existingEvent) {
      console.log(`[${requestId}] [INFO] Evento duplicado detectado, retornando evento existente`, {
        idempotency_key: payload.idempotency_key,
        existing_event_id: existingEvent.id,
        existing_processed_at: existingEvent.processed_at,
      });
      return new Response(
        JSON.stringify({
          event_id: existingEvent.id,
          message: 'Event already processed',
          idempotency_key: payload.idempotency_key,
          request_id: requestId,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.log(`[${requestId}] [INFO] Evento nuevo, no duplicado`);

    // 4. Guardar evento completo en webhook_events
    console.log(`[${requestId}] [DEBUG] Guardando evento en base de datos`);
    
    const insertData = {
      event_id: payload.id,
      event_type: payload.event,
      idempotency_key: payload.idempotency_key,
      payload: payload,
      signature: signature,
      timestamp: new Date(payload.timestamp),
      correlation_id: payload.metadata.correlation_id,
      source_url: req.headers.get('Referer') || req.headers.get('Origin') || 'unknown'
    };

    console.log(`[${requestId}] [DEBUG] Datos a insertar`, {
      event_id: insertData.event_id,
      event_type: insertData.event_type,
      idempotency_key: insertData.idempotency_key,
      correlation_id: insertData.correlation_id,
      timestamp: insertData.timestamp,
    });

    const { data: savedEvent, error: insertError } = await supabase
      .from('webhook_events')
      .insert(insertData)
      .select('id')
      .single();

    if (insertError) {
      console.error(`[${requestId}] [ERROR] Error al guardar evento en base de datos`, {
        error: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
      });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save event',
          details: insertError.message,
          code: insertError.code,
          request_id: requestId,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const processingTime = Date.now() - startTime;
    console.log(`[${requestId}] [INFO] Webhook event guardado exitosamente`, {
      event_id: savedEvent.id,
      event_type: payload.event,
      correlation_id: payload.metadata.correlation_id,
      idempotency_key: payload.idempotency_key,
      processing_time_ms: processingTime,
    });

    // 5. Retornar 200 OK con event_id generado
    return new Response(
      JSON.stringify({
        event_id: savedEvent.id,
        message: 'Event logged successfully',
        idempotency_key: payload.idempotency_key,
        request_id: requestId,
        processing_time_ms: processingTime,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] [ERROR] Error procesando webhook`, {
      error: error.message,
      stack: error.stack,
      processing_time_ms: processingTime,
    });
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        request_id: requestId,
        processing_time_ms: processingTime,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Genera firma HMAC-SHA256 del payload
 */
function generateHMACSignature(payload: WebhookPayload, secret: string): string {
  const payloadString = JSON.stringify(payload);
  const hmac = createHmac('sha256', secret);
  hmac.update(payloadString);
  return hmac.digest('hex');
}




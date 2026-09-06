import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

/**
 * Edge Function: Webhook DLQ Replay
 * Reenvía webhooks desde la Dead Letter Queue (DLQ)
 * Permite recuperar webhooks que fallaron después de todos los reintentos
 * 
 * Requiere autenticación: Authorization: Bearer <ANON_KEY o SERVICE_ROLE_KEY>
 */
Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    console.log(`[${requestId}] [INFO] Webhook DLQ Replay iniciado`, {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
      has_auth: !!req.headers.get('Authorization'),
    });

    // Verificar autenticación (si está habilitada)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn(`[${requestId}] [WARN] Petición sin header de autorización`);
      // Continuar de todas formas, pero registrar el warning
    }

    // Obtener variables de entorno
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || supabaseServiceKey;

    console.log(`[${requestId}] [DEBUG] Variables de entorno cargadas`, {
      supabaseUrl: supabaseUrl ? '✓' : '✗',
      supabaseServiceKey: supabaseServiceKey ? '✓' : '✗',
      supabaseAnonKey: supabaseAnonKey ? '✓' : '✗',
    });

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log(`[${requestId}] [DEBUG] Cliente Supabase inicializado`);

    // Obtener parámetros de la petición
    const url = new URL(req.url);
    const deliveryId = url.searchParams.get('delivery_id');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    console.log(`[${requestId}] [INFO] Parámetros de petición`, {
      delivery_id: deliveryId || 'no especificado',
      limit: limit,
      mode: deliveryId ? 'single' : 'batch',
    });

    // Si se proporciona delivery_id, reenviar ese específico
    if (deliveryId) {
      console.log(`[${requestId}] [INFO] Modo: Replay de delivery individual`);
      return await replaySingleDelivery(supabase, deliveryId, requestId, supabaseAnonKey);
    }

    // Si no, obtener los más antiguos de la DLQ y reenviarlos
    console.log(`[${requestId}] [INFO] Modo: Replay batch de DLQ`, {
      limit: limit,
    });
    
    console.log(`[${requestId}] [DEBUG] Consultando deliveries en DLQ`);
    const { data: dlqDeliveries, error: fetchError } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('status', 'dlq')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (fetchError) {
      console.error(`[${requestId}] [ERROR] Error al obtener deliveries de DLQ`, {
        error: fetchError.message,
        code: fetchError.code,
        details: fetchError.details,
      });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch DLQ deliveries',
          details: fetchError.message,
          request_id: requestId,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] [INFO] Deliveries encontrados en DLQ`, {
      count: dlqDeliveries?.length || 0,
    });

    if (!dlqDeliveries || dlqDeliveries.length === 0) {
      console.log(`[${requestId}] [INFO] No hay deliveries en DLQ`);
      return new Response(
        JSON.stringify({ 
          message: 'No deliveries in DLQ',
          count: 0,
          request_id: requestId,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Reenviar cada delivery
    console.log(`[${requestId}] [INFO] Iniciando replay de ${dlqDeliveries.length} deliveries`);
    const results = [];
    
    for (let i = 0; i < dlqDeliveries.length; i++) {
      const delivery = dlqDeliveries[i];
      console.log(`[${requestId}] [DEBUG] Procesando delivery ${i + 1}/${dlqDeliveries.length}`, {
        delivery_id: delivery.id,
        event_type: delivery.event_type,
        subscriber_url: delivery.subscriber_url,
        attempt_number: delivery.attempt_number,
      });
      
      try {
        const result = await replayDelivery(supabase, delivery, requestId, supabaseAnonKey);
        results.push({
          delivery_id: delivery.id,
          success: result.success,
          error: result.error,
        });
        
        console.log(`[${requestId}] [INFO] Delivery ${i + 1}/${dlqDeliveries.length} procesado`, {
          delivery_id: delivery.id,
          success: result.success,
          error: result.error || null,
        });
      } catch (error) {
        console.error(`[${requestId}] [ERROR] Error al procesar delivery ${i + 1}/${dlqDeliveries.length}`, {
          delivery_id: delivery.id,
          error: error.message,
          stack: error.stack,
        });
        
        results.push({
          delivery_id: delivery.id,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const processingTime = Date.now() - startTime;

    console.log(`[${requestId}] [INFO] DLQ replay completado`, {
      total: results.length,
      success: successCount,
      failures: failureCount,
      processing_time_ms: processingTime,
    });

    return new Response(
      JSON.stringify({
        message: 'DLQ replay completed',
        total: results.length,
        success: successCount,
        failures: failureCount,
        results: results,
        request_id: requestId,
        processing_time_ms: processingTime,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] [ERROR] Error en DLQ replay`, {
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
 * Reenvía un delivery específico por ID
 */
async function replaySingleDelivery(supabase: any, deliveryId: string, requestId: string, anonKey: string) {
  console.log(`[${requestId}] [DEBUG] Buscando delivery individual`, {
    delivery_id: deliveryId,
  });
  
  const { data: delivery, error: fetchError } = await supabase
    .from('webhook_deliveries')
    .select('*')
    .eq('id', deliveryId)
    .eq('status', 'dlq')
    .single();

  if (fetchError || !delivery) {
    console.error(`[${requestId}] [ERROR] Delivery no encontrado o no está en DLQ`, {
      delivery_id: deliveryId,
      error: fetchError?.message,
      code: fetchError?.code,
    });
    return new Response(
      JSON.stringify({ 
        error: 'Delivery not found or not in DLQ',
        delivery_id: deliveryId,
        request_id: requestId,
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  console.log(`[${requestId}] [INFO] Delivery encontrado`, {
    delivery_id: delivery.id,
    event_type: delivery.event_type,
    subscriber_url: delivery.subscriber_url,
    attempt_number: delivery.attempt_number,
    created_at: delivery.created_at,
  });

  const result = await replayDelivery(supabase, delivery, requestId, anonKey);

  return new Response(
    JSON.stringify({
      delivery_id: deliveryId,
      success: result.success,
      error: result.error,
      message: result.success ? 'Delivery replayed successfully' : 'Delivery replay failed',
      request_id: requestId,
    }),
    { status: result.success ? 200 : 500, headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * Reenvía un delivery desde la DLQ
 */
async function replayDelivery(supabase: any, delivery: any, requestId: string, anonKey: string) {
  const replayStartTime = Date.now();
  
  try {
    console.log(`[${requestId}] [DEBUG] Iniciando replay de delivery`, {
      delivery_id: delivery.id,
      event_type: delivery.event_type,
      subscriber_url: delivery.subscriber_url,
    });
    
    const payload = delivery.payload;
    const subscriberUrl = delivery.subscriber_url;
    const signature = delivery.signature;
    const correlationId = delivery.correlation_id || payload.metadata?.correlation_id || '';

    // Preparar headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Event': payload.event,
      'X-Webhook-Id': payload.id,
      'X-Webhook-Timestamp': payload.timestamp,
      'X-Correlation-Id': correlationId,
      'X-Replay': 'true', // Indicar que es un replay
    };

    // Agregar autorización si es Supabase Edge Function
    if (subscriberUrl.includes('supabase.co/functions/v1/')) {
      if (anonKey) {
        headers['Authorization'] = `Bearer ${anonKey}`;
        console.log(`[${requestId}] [DEBUG] Agregado header de autorización para Supabase Edge Function`);
      } else {
        console.warn(`[${requestId}] [WARN] No se encontró SUPABASE_ANON_KEY, el replay puede fallar con 401`);
      }
    }

    console.log(`[${requestId}] [DEBUG] Enviando HTTP POST al suscriptor`, {
      url: subscriberUrl,
      event: payload.event,
      has_authorization: !!headers['Authorization'],
      authorization_preview: headers['Authorization'] ? headers['Authorization'].substring(0, 20) + '...' : 'none',
    });

    // Enviar HTTP POST al suscriptor
    const httpStartTime = Date.now();
    const response = await fetch(subscriberUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const httpTime = Date.now() - httpStartTime;

    const success = response.ok;
    let responseBody: string | null = null;
    let errorMessage: string | null = null;

    try {
      responseBody = await response.text();
    } catch (e) {
      console.warn(`[${requestId}] [WARN] No se pudo leer el body de la respuesta`);
    }

    if (!success) {
      errorMessage = `${response.status}: ${response.statusText}`;
      
      // Log detallado para errores 401
      if (response.status === 401) {
        console.error(`[${requestId}] [ERROR] Error 401 Unauthorized al reenviar webhook`, {
          delivery_id: delivery.id,
          subscriber_url: subscriberUrl,
          is_supabase_function: subscriberUrl.includes('supabase.co/functions/v1/'),
          has_authorization_header: !!headers['Authorization'],
          response_body: responseBody?.substring(0, 200) || 'no body',
        });
      }
    }

    console.log(`[${requestId}] [INFO] Respuesta HTTP recibida`, {
      delivery_id: delivery.id,
      status: response.status,
      statusText: response.statusText,
      success: success,
      http_time_ms: httpTime,
      response_body_length: responseBody?.length || 0,
    });

    // Actualizar el registro del delivery
    const updateData: any = {
      status: success ? 'success' : 'dlq',
      http_status_code: response.status,
      response_body: responseBody,
      error_message: errorMessage,
      delivered_at: success ? new Date().toISOString() : null,
    };

    console.log(`[${requestId}] [DEBUG] Actualizando registro de delivery`, {
      delivery_id: delivery.id,
      new_status: updateData.status,
      http_status_code: updateData.http_status_code,
    });

    const { error: updateError } = await supabase
      .from('webhook_deliveries')
      .update(updateData)
      .eq('id', delivery.id);

    if (updateError) {
      console.error(`[${requestId}] [ERROR] Error al actualizar delivery`, {
        delivery_id: delivery.id,
        error: updateError.message,
        code: updateError.code,
      });
    } else {
      console.log(`[${requestId}] [INFO] Delivery actualizado exitosamente`);
    }

    const replayTime = Date.now() - replayStartTime;
    console.log(`[${requestId}] [INFO] Replay de delivery completado`, {
      delivery_id: delivery.id,
      success: success,
      error: errorMessage,
      replay_time_ms: replayTime,
    });

    return { success, error: errorMessage };
  } catch (error) {
    const replayTime = Date.now() - replayStartTime;
    console.error(`[${requestId}] [ERROR] Error en replay de delivery`, {
      delivery_id: delivery.id,
      error: error.message,
      stack: error.stack,
      replay_time_ms: replayTime,
    });
    
    // Actualizar con error
    const { error: updateError } = await supabase
      .from('webhook_deliveries')
      .update({
        error_message: error.message,
        status: 'dlq'
      })
      .eq('id', delivery.id);

    if (updateError) {
      console.error(`[${requestId}] [ERROR] Error al actualizar delivery con error`, {
        delivery_id: delivery.id,
        update_error: updateError.message,
      });
    }

    return { success: false, error: error.message };
  }
}




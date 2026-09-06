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
 * Edge Function 2: Webhook External Notifier
 * Valida firma HMAC, verifica idempotencia, y envía notificaciones por correo electrónico
 */
Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    console.log(`[${requestId}] [INFO] Webhook External Notifier iniciado`, {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
    });

    // Obtener variables de entorno
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET') || 'default-secret-change-me';
    
    // Configuración de email - Usar Resend (recomendado) o SendGrid
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY') || '';
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'noreply@example.com';
    const emailTo = Deno.env.get('EMAIL_TO') || '';

    console.log(`[${requestId}] [DEBUG] Variables de entorno cargadas`, {
      supabaseUrl: supabaseUrl ? '✓' : '✗',
      supabaseServiceKey: supabaseServiceKey ? '✓' : '✗',
      webhookSecret: webhookSecret ? '✓' : '✗',
      resendApiKey: resendApiKey ? '✓' : '✗',
      sendGridApiKey: sendGridApiKey ? '✓' : '✗',
      emailFrom: emailFrom || 'no configurado',
      emailTo: emailTo || 'no configurado',
    });

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log(`[${requestId}] [DEBUG] Cliente Supabase inicializado`);

    // Obtener payload y headers
    const payload: WebhookPayload = await req.json();
    const signature = req.headers.get('X-Webhook-Signature') || '';
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

    // 2. Verificar idempotencia con processed_webhooks
    console.log(`[${requestId}] [DEBUG] Verificando idempotencia en processed_webhooks`, {
      idempotency_key: payload.idempotency_key,
    });
    
    const { data: processed, error: idempotencyError } = await supabase
      .from('processed_webhooks')
      .select('id, processed_at, expires_at')
      .eq('idempotency_key', payload.idempotency_key)
      .single();

    if (idempotencyError && idempotencyError.code !== 'PGRST116') {
      console.error(`[${requestId}] [ERROR] Error al verificar idempotencia`, {
        error: idempotencyError.message,
        code: idempotencyError.code,
      });
    }

    if (processed) {
      console.log(`[${requestId}] [INFO] Webhook ya procesado anteriormente`, {
        idempotency_key: payload.idempotency_key,
        processed_at: processed.processed_at,
        expires_at: processed.expires_at,
      });
      return new Response(
        JSON.stringify({
          message: 'Webhook already processed',
          idempotency_key: payload.idempotency_key,
          request_id: requestId,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.log(`[${requestId}] [INFO] Webhook nuevo, no procesado anteriormente`);

    // 3. Registrar que se está procesando (prevenir procesamiento concurrente)
    console.log(`[${requestId}] [DEBUG] Registrando webhook como procesado`);
    
    const { error: insertError } = await supabase
      .from('processed_webhooks')
      .insert({
        idempotency_key: payload.idempotency_key,
        event_type: payload.event,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
      });

    if (insertError && !insertError.message.includes('duplicate')) {
      console.error(`[${requestId}] [WARN] Error al registrar processed_webhook (continuando)`, {
        error: insertError.message,
        code: insertError.code,
      });
      // Continuar de todas formas
    } else if (insertError && insertError.message.includes('duplicate')) {
      console.log(`[${requestId}] [INFO] Webhook duplicado detectado durante inserción (condición de carrera)`);
    } else {
      console.log(`[${requestId}] [INFO] Webhook registrado como procesado`);
    }

    // 4. Enviar notificación por correo electrónico
    console.log(`[${requestId}] [DEBUG] Iniciando envío de notificación por email`);
    let notificationResult = { success: false, error: null as string | null, provider: 'none' as string };
    
    // Priorizar Resend si está configurado (más simple y confiable)
    if (resendApiKey && emailTo) {
      console.log(`[${requestId}] [INFO] Usando Resend para envío de email`, {
        from: emailFrom,
        to: emailTo,
      });
      
      try {
        const emailContent = formatEmailContent(payload);
        const emailStartTime = Date.now();
        
        console.log(`[${requestId}] [DEBUG] Enviando email vía Resend API`);
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: emailFrom,
            to: emailTo.split(',').map((e: string) => e.trim()),
            subject: `🔔 Webhook: ${payload.event}`,
            html: emailContent
          })
        });

        const emailTime = Date.now() - emailStartTime;
        
        if (resendResponse.ok) {
          const result = await resendResponse.json();
          notificationResult.success = true;
          notificationResult.provider = 'resend';
          console.log(`[${requestId}] [INFO] Email enviado exitosamente vía Resend`, {
            email_id: result.id,
            from: emailFrom,
            to: emailTo,
            processing_time_ms: emailTime,
          });
        } else {
          const errorData = await resendResponse.json();
          notificationResult.error = errorData.message || 'Resend API error';
          notificationResult.provider = 'resend';
          console.error(`[${requestId}] [ERROR] Error al enviar email vía Resend`, {
            status: resendResponse.status,
            statusText: resendResponse.statusText,
            error: errorData,
            processing_time_ms: emailTime,
          });
        }
      } catch (error) {
        notificationResult.error = error.message;
        notificationResult.provider = 'resend';
        console.error(`[${requestId}] [ERROR] Excepción al enviar email vía Resend`, {
          error: error.message,
          stack: error.stack,
        });
      }
    } else if (sendGridApiKey && emailTo) {
      console.log(`[${requestId}] [INFO] Usando SendGrid para envío de email`, {
        from: emailFrom,
        to: emailTo,
      });
      
      // Alternativa: SendGrid
      try {
        const emailContent = formatEmailContent(payload);
        const emailStartTime = Date.now();
        
        console.log(`[${requestId}] [DEBUG] Enviando email vía SendGrid API`);
        const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendGridApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{
              to: emailTo.split(',').map((email: string) => ({ email: email.trim() }))
            }],
            from: { email: emailFrom },
            subject: `🔔 Webhook: ${payload.event}`,
            content: [{
              type: 'text/html',
              value: emailContent
            }]
          })
        });

        const emailTime = Date.now() - emailStartTime;

        if (sendGridResponse.ok || sendGridResponse.status === 202) {
          notificationResult.success = true;
          notificationResult.provider = 'sendgrid';
          console.log(`[${requestId}] [INFO] Email enviado exitosamente vía SendGrid`, {
            from: emailFrom,
            to: emailTo,
            processing_time_ms: emailTime,
          });
        } else {
          const errorText = await sendGridResponse.text();
          notificationResult.error = errorText || 'SendGrid API error';
          notificationResult.provider = 'sendgrid';
          console.error(`[${requestId}] [ERROR] Error al enviar email vía SendGrid`, {
            status: sendGridResponse.status,
            statusText: sendGridResponse.statusText,
            error: errorText,
            processing_time_ms: emailTime,
          });
        }
      } catch (error) {
        notificationResult.error = error.message;
        notificationResult.provider = 'sendgrid';
        console.error(`[${requestId}] [ERROR] Excepción al enviar email vía SendGrid`, {
          error: error.message,
          stack: error.stack,
        });
      }
    } else {
      console.warn(`[${requestId}] [WARN] Credenciales de email no configuradas`, {
        resendApiKey: resendApiKey ? '✓' : '✗',
        sendGridApiKey: sendGridApiKey ? '✓' : '✗',
        emailTo: emailTo || 'no configurado',
        action: 'skipping notification',
      });
      notificationResult.success = true; // Considerar éxito si no está configurado
      notificationResult.provider = 'none';
    }

    // 5. Registrar resultado de notificación
    if (!notificationResult.success) {
      const processingTime = Date.now() - startTime;
      console.error(`[${requestId}] [ERROR] Notificación falló`, {
        provider: notificationResult.provider,
        error: notificationResult.error,
        processing_time_ms: processingTime,
      });
      // Retornar 500 para que el sistema reintente
      return new Response(
        JSON.stringify({
          error: 'Notification failed',
          details: notificationResult.error,
          provider: notificationResult.provider,
          request_id: requestId,
          processing_time_ms: processingTime,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 6. Retornar 200 OK
    const processingTime = Date.now() - startTime;
    console.log(`[${requestId}] [INFO] Webhook notification procesado exitosamente`, {
      event_type: payload.event,
      idempotency_key: payload.idempotency_key,
      correlation_id: payload.metadata.correlation_id,
      provider: notificationResult.provider,
      processing_time_ms: processingTime,
    });

    return new Response(
      JSON.stringify({
        message: 'Notification sent successfully',
        idempotency_key: payload.idempotency_key,
        provider: notificationResult.provider,
        request_id: requestId,
        processing_time_ms: processingTime,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] [ERROR] Error procesando webhook notification`, {
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

/**
 * Formatea el contenido del email en HTML
 */
function formatEmailContent(payload: WebhookPayload): string {
  const { event, data, metadata } = payload;
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .event-info { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #4CAF50; }
        .data-section { background-color: white; padding: 15px; margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; margin-left: 10px; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔔 Notificación de Webhook</h2>
        </div>
        <div class="content">
          <div class="event-info">
            <p><span class="label">Evento:</span><span class="value">${event}</span></p>
            <p><span class="label">Timestamp:</span><span class="value">${new Date(payload.timestamp).toLocaleString('es-ES')}</span></p>
            ${metadata.correlation_id ? `<p><span class="label">Correlation ID:</span><span class="value">${metadata.correlation_id}</span></p>` : ''}
          </div>
          <div class="data-section">
            <h3>Datos del Evento:</h3>
            ${formatEventData(event, data)}
          </div>
        </div>
        <div class="footer">
          <p>Este es un mensaje automático del sistema de webhooks.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return html;
}

/**
 * Formatea los datos específicos según el tipo de evento
 */
function formatEventData(event: string, data: Record<string, any>): string {
  if (event === 'verification.pending') {
    return `
      <p><span class="label">📋 Verificación Pendiente</span></p>
      <p><span class="label">ID de Verificación:</span><span class="value">${data.verification_id || 'N/A'}</span></p>
      <p><span class="label">ID de Arquitecto:</span><span class="value">${data.architect_id || 'N/A'}</span></p>
      <p><span class="label">Estado:</span><span class="value">${data.estado || 'N/A'}</span></p>
      <p><span class="label">ID de Moderador:</span><span class="value">${data.moderador_id || 'N/A'}</span></p>
      <p><span class="label">Fecha de Verificación:</span><span class="value">${data.fecha_verificacion ? new Date(data.fecha_verificacion).toLocaleString('es-ES') : 'N/A'}</span></p>
    `;
  } else if (event === 'architect.registered') {
    return `
      <p><span class="label">👤 Arquitecto Registrado</span></p>
      <p><span class="label">ID de Arquitecto:</span><span class="value">${data.architect_id || 'N/A'}</span></p>
      <p><span class="label">Cédula:</span><span class="value">${data.cedula || 'N/A'}</span></p>
      <p><span class="label">ID de Usuario:</span><span class="value">${data.usuario_id || 'N/A'}</span></p>
      <p><span class="label">Verificado:</span><span class="value">${data.verificado ? 'Sí' : 'No'}</span></p>
    `;
  } else {
    return `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  }
}




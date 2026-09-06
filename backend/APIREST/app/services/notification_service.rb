require 'net/http'
require 'json'

class NotificationService
  class << self
    WEBSOCKET_URL = "http://localhost:3006"
    
    # ========================================
    # 1. NOTIFICACIÓN: PROYECTO CREADO
    # ========================================
    def notify_proyecto_creado(proyecto)
      return unless proyecto.cliente_id.present?
      
      cliente = proyecto.cliente
      return unless cliente
      
      # Obtener el nombre completo del cliente
      cliente_nombre = "#{cliente.usuario.nombre} #{cliente.usuario.apellido}"
      arquitecto_nombre = "#{proyecto.arquitecto.usuario.nombre} #{proyecto.arquitecto.usuario.apellido}"
      
      mensaje = "El arquitecto #{arquitecto_nombre} ha creado un nuevo proyecto: #{proyecto.titulo_proyecto}"
      
      # Guardar en base de datos
      notificacion = Notificacion.create!(
        usuario_id: cliente.usuario_id,
        mensaje: mensaje,
        fecha: Date.current,
        leido: false
      )
      
      Rails.logger.info "📬 Notificación creada en BD para #{cliente_nombre} (ID: #{cliente.usuario_id})"
      Rails.logger.info "   Mensaje: #{mensaje}"
      
      # Enviar por WebSocket
      enviar_websocket('/api/notificaciones/emit', {
        event: 'nueva_notificacion',
        usuario_id: cliente.usuario_id,
        data: notificacion.as_json.merge({
          cliente_nombre: cliente_nombre,
          arquitecto_nombre: arquitecto_nombre,
          proyecto_titulo: proyecto.titulo_proyecto
        })
      })
    end
    
    # ========================================
    # 2. NOTIFICACIÓN: ARQUITECTO VERIFICADO
    # ========================================
    def notify_arquitecto_verificado(arquitecto)
      mensaje = "¡Felicitaciones! Tu cuenta de arquitecto ha sido verificada. Ahora tienes acceso a funciones premium."
      
      # Guardar en base de datos
      notificacion = Notificacion.create!(
        usuario_id: arquitecto.usuario_id,
        mensaje: mensaje,
        fecha: Date.current,
        leido: false
      )
      
      Rails.logger.info "📬 Notificación creada en BD para arquitecto #{arquitecto.usuario_id}: #{mensaje}"
      
      # Enviar por WebSocket
      enviar_websocket('/api/notificaciones/emit', {
        event: 'arquitecto_verificado',
        usuario_id: arquitecto.usuario_id,
        data: notificacion.as_json
      })
    end
    
    # ========================================
    # 3. NOTIFICACIÓN: NUEVO MENSAJE
    # ========================================
    def notify_nuevo_mensaje(mensaje)
      conversacion = mensaje.conversacion
      remitente = mensaje.remitente
      
      # Determinar el destinatario (el que NO envió el mensaje)
      if conversacion.cliente.usuario_id == remitente.id
        # El cliente envió el mensaje, notificar al arquitecto
        destinatario_usuario_id = conversacion.arquitecto.usuario_id
        nombre_remitente = remitente.nombre
      elsif conversacion.arquitecto.usuario_id == remitente.id
        # El arquitecto envió el mensaje, notificar al cliente
        destinatario_usuario_id = conversacion.cliente.usuario_id
        nombre_remitente = remitente.nombre
      else
        Rails.logger.warn "⚠️ Remitente no pertenece a la conversación"
        return
      end
      
      # Crear mensaje de notificación con preview del contenido
      preview = mensaje.contenido.length > 50 ? "#{mensaje.contenido[0..47]}..." : mensaje.contenido
      texto_notificacion = "Nuevo mensaje de #{nombre_remitente}: #{preview}"
      
      # Guardar en base de datos
      notificacion = Notificacion.create!(
        usuario_id: destinatario_usuario_id,
        mensaje: texto_notificacion,
        fecha: Date.current,
        leido: false
      )
      
      Rails.logger.info "📬 Notificación creada en BD para usuario #{destinatario_usuario_id}: #{texto_notificacion}"
      
      # Enviar por WebSocket
      enviar_websocket('/chat/nuevoMensaje', {
        mensaje: mensaje.as_json(include: [:remitente, :imagenes]),
        conversacion_id: conversacion.id,
        destinatario_id: destinatario_usuario_id,
        notificacion: notificacion.as_json
      })
    end
    
    # ========================================
    # 4. NOTIFICACIÓN: CONVERSACIÓN CREADA
    # ========================================
    def notify_conversacion_creada(conversacion)
      # Guardar en base de datos
      Rails.logger.info "📬 Conversación creada: #{conversacion.id}"
      
      # Enviar por WebSocket
      enviar_websocket('/chat/nuevaConversacion', {
        conversacion: conversacion.as_json(
          include: {
            cliente: { include: :usuario },
            arquitecto: { include: :usuario }
          }
        ),
        participante_ids: conversacion.participante_ids
      })
    end
    
    private
    
    # ========================================
    # MÉTODO AUXILIAR: ENVIAR WEBSOCKET
    # ========================================
    def enviar_websocket(endpoint, payload)
      uri = URI.parse("#{WEBSOCKET_URL}#{endpoint}")
      http = Net::HTTP.new(uri.host, uri.port)
      request = Net::HTTP::Post.new(uri.path, 'Content-Type' => 'application/json')
      request.body = payload.to_json
      
      Rails.logger.info "📤 Enviando a WebSocket #{endpoint}"
      Rails.logger.debug "   Payload: #{payload.to_json}"
      
      begin
        response = http.request(request)
        Rails.logger.info "✅ WebSocket respondió: #{response.code} - #{response.message}"
      rescue => e
        Rails.logger.error "❌ Error enviando a WebSocket: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
      end
    end
  end
end

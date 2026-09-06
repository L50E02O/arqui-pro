require 'net/http'
require 'json'

module WebSocketNotifier
  class << self
    def notify_conversation_created(conversacion)
      uri = URI.parse("http://localhost:3006/chat/nuevaConversacion")
      http = Net::HTTP.new(uri.host, uri.port)
      request = Net::HTTP::Post.new(uri.path, 'Content-Type' => 'application/json')
      request.body = {
        conversacion: conversacion.as_json(
          include: {
            cliente: { include: :usuario },
            arquitecto: { include: :usuario }
          }
        ),
        participante_ids: conversacion.participante_ids
      }.to_json
      
      Rails.logger.info "📤 Enviando notificación WebSocket para conversación #{conversacion.id}"
      Rails.logger.info "   Participantes: #{conversacion.participante_ids.join(', ')}"
      
      begin
        response = http.request(request)
        Rails.logger.info "✅ WebSocket notification sent: #{response.code} - #{response.message}"
      rescue => e
        Rails.logger.error "❌ Error notifying WebSocket: #{e.message}"
      end
    end

    def notify_message_created(mensaje)
      uri = URI.parse("http://localhost:3006/mensajes/nuevoMensaje")
      http = Net::HTTP.new(uri.host, uri.port)
      request = Net::HTTP::Post.new(uri.path, 'Content-Type' => 'application/json')
      request.body = {
        mensaje: mensaje.as_json,
        conversacion_id: mensaje.conversacion_id
      }.to_json
      
      begin
        response = http.request(request)
        Rails.logger.info "WebSocket notification sent for message #{mensaje.id}: #{response.code} - #{response.message}"
      rescue => e
        Rails.logger.error "Error notifying WebSocket for message: #{e.message}"
      end
    end
  end
end
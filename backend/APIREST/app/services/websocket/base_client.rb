# Cliente base para transmision de eventos HTTP hacia el servidor WebSocket de NestJS
require 'net/http'
require 'json'

module Websocket
  class BaseClient
    WS_SERVER_URL = ENV.fetch('WEBSOCKET_SERVER_URL', 'http://localhost:3006')

    class << self
      # Enviar evento a un endpoint especifico del servidor WebSocket
      def send_to_endpoint(uri, payload, descripcion)
        http = Net::HTTP.new(uri.host, uri.port)
        http.open_timeout = 2
        http.read_timeout = 2

        request = Net::HTTP::Post.new(uri.path, {
          'Content-Type' => 'application/json',
          'Accept' => 'application/json'
        })
        request.body = payload.to_json

        response = http.request(request)

        if response.code.to_i >= 200 && response.code.to_i < 300
          Rails.logger.info "[INFO] WebSocket notificado correctamente: #{descripcion}"
        else
          Rails.logger.warn "[WARN] WebSocket respondio con codigo: #{response.code} para #{descripcion}"
        end
      rescue Errno::ECONNREFUSED, Errno::EHOSTUNREACH, Net::OpenTimeout, Net::ReadTimeout => e
        Rails.logger.warn "[WARN] No se pudo conectar al servidor WebSocket (#{e.class}): #{descripcion}"
      rescue => e
        Rails.logger.error "[ERROR] Error enviando al WebSocket (#{descripcion}): #{e.message}"
      end

      # Enviar notificacion global/especifica al canal de notificaciones
      def send_notification(payload, usuario_id = nil)
        uri = URI("#{WS_SERVER_URL}/api/notificaciones/emit")

        http = Net::HTTP.new(uri.host, uri.port)
        http.open_timeout = 2
        http.read_timeout = 2

        request = Net::HTTP::Post.new(uri.path, {
          'Content-Type' => 'application/json',
          'Accept' => 'application/json'
        })

        body = payload.dup
        body[:usuario_id] = usuario_id if usuario_id
        request.body = body.to_json

        response = http.request(request)

        if response.code.to_i >= 200 && response.code.to_i < 300
          Rails.logger.info "[INFO] Notificacion emitida al WebSocket: #{payload[:evento]}"
        else
          Rails.logger.warn "[WARN] WebSocket emit notificacion respondio: #{response.code}"
        end
      rescue Errno::ECONNREFUSED, Errno::EHOSTUNREACH, Net::OpenTimeout, Net::ReadTimeout => e
        Rails.logger.warn "[WARN] Conexión rechazada o timeout con servidor WebSocket: #{e.class}"
      rescue => e
        Rails.logger.error "[ERROR] Error enviando notificacion a WebSocket: #{e.message}"
      end
    end
  end
end

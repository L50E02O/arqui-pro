# Fachada unificada para notificaciones hacia el microservicio WebSocket de NestJS
class WebsocketNotifier
  WS_SERVER_URL = Websocket::BaseClient::WS_SERVER_URL

  class << self
    # Notificar cuando se crea un proyecto
    def notify_proyecto_creado(proyecto)
      return unless proyecto.present?

      payload = {
        evento: 'proyecto:creado',
        data: {
          proyecto_id: proyecto.id,
          titulo: proyecto.titulo_proyecto,
          descripcion: proyecto.descripcion,
          cliente_id: proyecto.cliente_id,
          arquitecto_id: proyecto.arquitecto_id,
          timestamp: Time.now.iso8601
        }
      }

      Websocket::BaseClient.send_notification(payload, proyecto.cliente_id)
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando proyecto creado: #{e.message}"
    end

    # Notificar cuando un arquitecto es verificado
    def notify_arquitecto_verificado(arquitecto, verificacion_id, moderador_id)
      return unless arquitecto.present?

      uri = URI("#{WS_SERVER_URL}/api/verificaciones/emit/aprobada")
      payload = {
        arquitecto_id: arquitecto.id.to_s,
        verificacion_id: verificacion_id.to_s,
        moderador_id: moderador_id.to_s,
        fecha_verificacion: Time.now.iso8601
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "arquitecto verificado")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando arquitecto verificado: #{e.message}"
    end

    # Notificar cuando un arquitecto es rechazado
    def notify_arquitecto_rechazado(arquitecto)
      return unless arquitecto.present?

      payload = {
        evento: 'arquitecto:rechazado',
        data: {
          arquitecto_id: arquitecto.id,
          usuario_id: arquitecto.usuario_id,
          nombre: arquitecto.nombre,
          apellido: arquitecto.apellido,
          verificado: arquitecto.verificado,
          timestamp: Time.now.iso8601
        }
      }

      Websocket::BaseClient.send_notification(payload, arquitecto.usuario_id)
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando arquitecto rechazado: #{e.message}"
    end

    # Notificar cuando se crea una conversacion
    def notify_conversation_created(conversacion)
      return unless conversacion.present?

      payload = {
        evento: 'conversacion:creada',
        data: {
          conversacion_id: conversacion.id,
          cliente_id: conversacion.cliente_id,
          arquitecto_id: conversacion.arquitecto_id,
          fecha: conversacion.fecha,
          timestamp: Time.now.iso8601
        }
      }

      Websocket::BaseClient.send_notification(payload, conversacion.cliente.usuario_id) if conversacion.cliente
      Websocket::BaseClient.send_notification(payload, conversacion.arquitecto.usuario_id) if conversacion.arquitecto
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando conversacion creada: #{e.message}"
    end

    # =============== PROYECTOS ===============

    def notify_nuevo_proyecto(proyecto)
      return unless proyecto.present?

      uri = URI("#{WS_SERVER_URL}/api/proyectos/emit/nuevo")
      payload = {
        arquitecto_id: proyecto.arquitecto_id,
        proyecto: Websocket::Serializers.proyecto_to_json(proyecto)
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "nuevo proyecto")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando nuevo proyecto: #{e.message}"
    end

    def notify_proyecto_actualizado(proyecto)
      return unless proyecto.present?

      uri = URI("#{WS_SERVER_URL}/api/proyectos/emit/actualizado")
      payload = {
        proyecto_id: proyecto.id,
        arquitecto_id: proyecto.arquitecto_id,
        proyecto: Websocket::Serializers.proyecto_to_json(proyecto)
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "proyecto actualizado")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando proyecto actualizado: #{e.message}"
    end

    def notify_proyecto_estado_cambiado(proyecto, estado_anterior)
      return unless proyecto.present?

      uri = URI("#{WS_SERVER_URL}/api/proyectos/emit/estado")
      payload = {
        proyecto_id: proyecto.id,
        arquitecto_id: proyecto.arquitecto_id,
        cliente_id: proyecto.cliente_id,
        estado_anterior: estado_anterior,
        estado_nuevo: proyecto.tipo_proyecto,
        proyecto: Websocket::Serializers.proyecto_to_json(proyecto)
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "cambio de estado de proyecto")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando cambio de estado: #{e.message}"
    end

    def notify_proyecto_asignado(proyecto)
      return unless proyecto.present? && proyecto.cliente_id.present?

      uri = URI("#{WS_SERVER_URL}/api/proyectos/emit/asignado")
      payload = {
        cliente_id: proyecto.cliente_id,
        proyecto: Websocket::Serializers.proyecto_to_json(proyecto)
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "proyecto asignado")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando proyecto asignado: #{e.message}"
    end

    # =============== AVANCES ===============

    def notify_nuevo_avance(avance)
      return unless avance.present? && avance.proyecto.present?

      uri = URI("#{WS_SERVER_URL}/api/avances/emit/nuevo")
      payload = {
        proyecto_id: avance.proyecto_id,
        arquitecto_id: avance.proyecto.arquitecto_id,
        cliente_id: avance.proyecto.cliente_id,
        avance: Websocket::Serializers.avance_to_json(avance)
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "nuevo avance")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando nuevo avance: #{e.message}"
    end

    def notify_avance_actualizado(avance)
      return unless avance.present?

      uri = URI("#{WS_SERVER_URL}/api/avances/emit/actualizado")
      payload = {
        proyecto_id: avance.proyecto_id,
        avance: Websocket::Serializers.avance_to_json(avance)
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "avance actualizado")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando avance actualizado: #{e.message}"
    end

    def notify_avance_eliminado(proyecto_id, avance_id)
      return unless proyecto_id.present? && avance_id.present?

      uri = URI("#{WS_SERVER_URL}/api/avances/emit/eliminado")
      payload = {
        proyecto_id: proyecto_id,
        avance_id: avance_id
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "avance eliminado")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando avance eliminado: #{e.message}"
    end

    # =============== INCIDENCIAS ===============

    def notify_nueva_incidencia(incidencia)
      return unless incidencia.present?

      uri = URI("#{WS_SERVER_URL}/api/incidencias/emit/nueva")
      payload = {
        usuario_emisor_id: incidencia.usuario_emisor_id,
        usuario_infractor_id: incidencia.usuario_infractor_id,
        incidencia: Websocket::Serializers.incidencia_to_json(incidencia)
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "nueva incidencia")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando nueva incidencia: #{e.message}"
    end

    def notify_incidencia_estado_cambiado(incidencia, estado_anterior)
      return unless incidencia.present?

      uri = URI("#{WS_SERVER_URL}/api/incidencias/emit/estado")
      payload = {
        incidencia_id: incidencia.id,
        usuario_emisor_id: incidencia.usuario_emisor_id,
        usuario_infractor_id: incidencia.usuario_infractor_id,
        estado_anterior: estado_anterior,
        estado_nuevo: incidencia.estado,
        incidencia: Websocket::Serializers.incidencia_to_json(incidencia)
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "cambio de estado de incidencia")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando cambio de estado de incidencia: #{e.message}"
    end

    def notify_incidencia_asignada(incidencia)
      return unless incidencia.present? && incidencia.moderador_id.present?

      moderador = Moderador.find_by(id: incidencia.moderador_id)
      return unless moderador&.usuario_id

      uri = URI("#{WS_SERVER_URL}/api/incidencias/emit/asignada")
      payload = {
        moderador_id: moderador.usuario_id,
        incidencia: Websocket::Serializers.incidencia_to_json(incidencia)
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "incidencia asignada")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando incidencia asignada: #{e.message}"
    end

    def notify_incidencia_resuelta(incidencia)
      return unless incidencia.present?

      uri = URI("#{WS_SERVER_URL}/api/incidencias/emit/resuelta")
      payload = {
        incidencia_id: incidencia.id,
        usuario_emisor_id: incidencia.usuario_emisor_id,
        usuario_infractor_id: incidencia.usuario_infractor_id,
        incidencia: Websocket::Serializers.incidencia_to_json(incidencia)
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "incidencia resuelta")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando incidencia resuelta: #{e.message}"
    end

    # =============== VALORACIONES ===============

    def notify_nueva_valoracion(valoracion)
      return unless valoracion.present? && valoracion.proyecto.present?

      uri = URI("#{WS_SERVER_URL}/api/valoraciones/emit/nueva")
      payload = {
        proyecto_id: valoracion.proyecto_id,
        arquitecto_id: valoracion.proyecto.arquitecto_id,
        cliente_id: valoracion.cliente_id,
        valoracion: Websocket::Serializers.valoracion_to_json(valoracion)
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "nueva valoracion")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando nueva valoracion: #{e.message}"
    end

    def notify_valoracion_promedio_actualizado(arquitecto)
      return unless arquitecto.present?

      total = Valoracion.joins(proyecto: :arquitecto)
                       .where(proyectos: { arquitecto_id: arquitecto.id })
                       .count

      uri = URI("#{WS_SERVER_URL}/api/valoraciones/emit/promedio")
      payload = {
        arquitecto_id: arquitecto.id,
        valoracion_promedio: arquitecto.valoracion_prom_proyecto || 0.0,
        total_valoraciones: total
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "promedio de valoracion actualizado")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando promedio actualizado: #{e.message}"
    end

    def notify_valoracion_actualizada(valoracion)
      return unless valoracion.present? && valoracion.proyecto.present?

      uri = URI("#{WS_SERVER_URL}/api/valoraciones/emit/actualizada")
      payload = {
        proyecto_id: valoracion.proyecto_id,
        arquitecto_id: valoracion.proyecto.arquitecto_id,
        valoracion: Websocket::Serializers.valoracion_to_json(valoracion)
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "valoracion actualizada")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando valoracion actualizada: #{e.message}"
    end

    def notify_valoracion_eliminada(proyecto_id, arquitecto_id, valoracion_id)
      return unless proyecto_id.present? && arquitecto_id.present? && valoracion_id.present?

      uri = URI("#{WS_SERVER_URL}/api/valoraciones/emit/eliminada")
      payload = {
        proyecto_id: proyecto_id,
        arquitecto_id: arquitecto_id,
        valoracion_id: valoracion_id
      }

      Websocket::BaseClient.send_to_endpoint(uri, payload, "valoracion eliminada")
    rescue => e
      Rails.logger.error "[ERROR] Fallo notificando valoracion eliminada: #{e.message}"
    end
  end
end

# Serializadores para eventos emitidos hacia el microservicio WebSocket
module Websocket
  class Serializers
    class << self
      def proyecto_to_json(proyecto)
        {
          id: proyecto.id,
          titulo_proyecto: proyecto.titulo_proyecto,
          descripcion: proyecto.descripcion,
          tipo_proyecto: proyecto.tipo_proyecto,
          valoracion_promedio: proyecto.valoracion_promedio,
          fecha_publicacion: proyecto.fecha_publicacion,
          arquitecto_id: proyecto.arquitecto_id,
          cliente_id: proyecto.cliente_id,
          conversacion_id: proyecto.conversacion_id,
          created_at: proyecto.created_at,
          updated_at: proyecto.updated_at
        }
      end

      def avance_to_json(avance)
        {
          id: avance.id,
          descripcion: avance.descripcion,
          fecha: avance.fecha,
          proyecto_id: avance.proyecto_id,
          created_at: avance.created_at,
          updated_at: avance.updated_at
        }
      end

      def incidencia_to_json(incidencia)
        {
          id: incidencia.id,
          descripcion: incidencia.descripcion,
          estado: incidencia.estado,
          fecha: incidencia.fecha,
          usuario_emisor_id: incidencia.usuario_emisor_id,
          usuario_infractor_id: incidencia.usuario_infractor_id,
          moderador_id: incidencia.moderador_id,
          created_at: incidencia.created_at,
          updated_at: incidencia.updated_at
        }
      end

      def valoracion_to_json(valoracion)
        {
          id: valoracion.id,
          calificacion: valoracion.calificacion,
          comentario: valoracion.comentario,
          fecha: valoracion.fecha,
          cliente_id: valoracion.cliente_id,
          proyecto_id: valoracion.proyecto_id,
          created_at: valoracion.created_at,
          updated_at: valoracion.updated_at
        }
      end
    end
  end
end

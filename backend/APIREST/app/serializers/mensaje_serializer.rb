class MensajeSerializer < ActiveModel::Serializer
  attributes :id, :contenido, :fecha_envio, :hora_envio, :leido, :conversacion_id, :remitente_id, :imagenes
  
  def imagenes
    object.imagenes.map do |imagen|
      {
        id: imagen.id,
        imagen_url: imagen.imagen_url,
        fecha: imagen.fecha
      }
    end
  end
end

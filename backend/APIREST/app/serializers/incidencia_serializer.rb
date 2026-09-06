class IncidenciaSerializer < ActiveModel::Serializer
  attributes :id, :descripcion, :estado, :fecha, :usuario_emisor_id, :usuario_infractor_id, :moderador_id, :imagenes
end

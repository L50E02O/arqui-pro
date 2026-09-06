class NotificacionSerializer < ActiveModel::Serializer
  attributes :id, :mensaje, :fecha, :leido, :usuario_id
end

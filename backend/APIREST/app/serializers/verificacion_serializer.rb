class VerificacionSerializer < ActiveModel::Serializer
  attributes :id, :estado, :fecha_verificacion, :arquitecto_id, :moderador_id
end

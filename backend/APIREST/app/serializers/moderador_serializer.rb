class ModeradorSerializer < ActiveModel::Serializer
  attributes :id, :num_incidencias_resueltas, :num_arquitectos_verificados
  belongs_to :usuario
end

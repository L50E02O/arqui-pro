class SolicitudProyectoSerializer < ActiveModel::Serializer
  attributes :id, :estado, :fecha, :arquitecto_id, :cliente_id
end

class ClienteSerializer < ActiveModel::Serializer
  attributes :id, :cedula

  belongs_to :usuario
end

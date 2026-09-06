class ConversacionSerializer < ActiveModel::Serializer
  attributes :id, :fecha, :cliente_id, :arquitecto_id
end

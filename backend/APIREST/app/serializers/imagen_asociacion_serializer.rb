class ImagenAsociacionSerializer < ActiveModel::Serializer
  attributes :id, :imagen_id, :asociable_id, :asociable_type
end

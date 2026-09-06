class ValoracionSerializer < ActiveModel::Serializer
  attributes :id, :calificacion, :comentario, :fecha, :cliente_id, :proyecto_id
  
  belongs_to :cliente
  belongs_to :proyecto
end

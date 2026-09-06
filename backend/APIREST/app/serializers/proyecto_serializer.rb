class ProyectoSerializer < ActiveModel::Serializer
  attributes :id, :titulo_proyecto, :valoracion_promedio, :descripcion, :tipo_proyecto,
  :fecha_publicacion, :arquitecto_id, :cliente_id, :conversacion_id, :solicitud_proyecto_id,
  :imagenes

  belongs_to :avances
end

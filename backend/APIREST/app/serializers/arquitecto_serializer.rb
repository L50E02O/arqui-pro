class ArquitectoSerializer < ActiveModel::Serializer
  attributes :id, :cedula, :valoracion_prom_proyecto, :descripcion, :especialidades, :ubicacion, :verificado, :vistas_perfil
  
  belongs_to :usuario
end

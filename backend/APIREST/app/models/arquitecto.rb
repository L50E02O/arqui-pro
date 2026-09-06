class Arquitecto < ApplicationRecord
  # Un arquitecto pertenece a un usuario
  # Cuando se elimina un arquitecto, se elimina también su usuario asociado
  belongs_to :usuario, dependent: :destroy, optional: true

  accepts_nested_attributes_for :usuario

  # Un arquitecto puede tener muchas conversaciones
  # Cuando se elimina un arquitecto, se eliminan también sus conversaciones
  has_many :conversaciones, dependent: :destroy

  # Un arquitecto puede tener una verificacion
  # Cuando se elimina un arquitecto, se elimina también su verificacion
  has_one :verificaciones, dependent: :destroy

  # Un arquitecto puede tener muchas solicitudes_proyecto
  has_many :solicitudes_proyecto

  # Un arquitecto puede tener muchos proyectos
  # Cuando se elimina un arquitecto, se elimina también su verificacion
  has_many :proyectos, dependent: :destroy

  # validaciones
  validates :cedula, presence: true, uniqueness: true
  validates :descripcion, :especialidades, :ubicacion, presence: true
  validates :verificado, inclusion: { in: [ true, false ] }
  # valoracion_prom_proyecto y vistas_perfil tienen valores por defecto en la BD
end

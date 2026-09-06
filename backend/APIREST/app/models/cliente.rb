class Cliente < ApplicationRecord
  belongs_to :usuario, dependent: :destroy, optional: true
  accepts_nested_attributes_for :usuario

  # Un cliente puede tener muchas conversaciones
  # Cuando se elimina un cliente, se eliminan también sus conversaciones
  has_many :conversaciones, dependent: :destroy

  # Un cliente puede tener muchas solicitudes de proyecto
  has_many :solicitudes_proyecto

  # Un cliente puede tener muchos proyectos
  has_many :proyectos

  # Un cliente tiene muchas valoraciones
  has_many :valoraciones

  # Validaciones
  validates :cedula, presence: true, uniqueness: true
end

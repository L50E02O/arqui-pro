class Moderador < ApplicationRecord
  # Cuando se elimina un moderador, se elimina también su usuario asociado
  belongs_to :usuario, dependent: :destroy, optional: true
  accepts_nested_attributes_for :usuario

  # Un moderador puede tener muchas verificaciones
  has_many :verificaciones

  # Un moderador tiene muchas incidencia
  has_many :incidencias

  # validates :usuario, presence: true
end

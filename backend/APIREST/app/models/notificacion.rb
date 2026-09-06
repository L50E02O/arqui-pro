class Notificacion < ApplicationRecord
  # Una notificación pertenece a un usuario
  belongs_to :usuario

  # validaciones
  validates :mensaje, presence: true
  validates :leido, inclusion: { in: [ true, false ] }
end

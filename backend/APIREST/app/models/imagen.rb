class Imagen < ApplicationRecord
  before_create :set_fecha
  
  has_many :imagen_asociaciones, dependent: :destroy
  has_many :incidencias, through: :imagen_asociaciones, source: :asociable, source_type: 'Incidencia'
  has_many :mensajes, through: :imagen_asociaciones, source: :asociable, source_type: 'Mensaje'
  has_many :avances_proyecto, through: :imagen_asociaciones, source: :asociable, source_type: 'Avance'
  has_many :proyectos, through: :imagen_asociacion, source: :asociable, source_type: "Proyecto"

  accepts_nested_attributes_for :imagen_asociaciones

  # validaciones
  validates :imagen_url, presence: true


  private
  def set_fecha()
    self.fecha ||= Time.current
  end
end

class SistemaLog < ApplicationRecord
  validates :tipo, presence: true
  validates :mensaje, presence: true
  validates :estado, inclusion: { in: ['exito', 'error'] }
  validates :fecha_ejecucion, presence: true

  scope :por_tipo, ->(tipo) { where(tipo: tipo) }
  scope :por_estado, ->(estado) { where(estado: estado) }
  scope :recientes, -> { order(fecha_ejecucion: :desc) }
  scope :ultimos_dias, ->(dias = 30) { where('fecha_ejecucion >= ?', dias.days.ago) }
end

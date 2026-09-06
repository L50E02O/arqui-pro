class Incidencia < ApplicationRecord
  before_create :set_fecha

  belongs_to :usuario_emisor, class_name: "Usuario", foreign_key: "usuario_emisor_id"
  belongs_to :usuario_infractor, class_name: "Usuario", foreign_key: "usuario_infractor_id"
  belongs_to :moderador, optional: true
  
  # Métodos para facilitar el acceso desde el controlador (en lugar de alias_attribute)
  def emisor
    usuario_emisor
  end
  
  def infractor
    usuario_infractor
  end

  has_many :imagen_asociaciones, as: :asociable, dependent: :destroy
  has_many :imagenes, through: :imagen_asociaciones

  # validaciones
  validates :descripcion, presence: true
  validates :estado, inclusion: { in: [ 'pendiente', 'resuelto', 'en_revision', 'rechazado' ] }

  # Callbacks para WebSocket
  after_create :notify_incidencia_creada
  after_update :notify_estado_cambiado, if: :saved_change_to_estado?
  after_update :notify_asignada_a_moderador, if: :saved_change_to_moderador_id?
  after_update :notify_incidencia_resuelta, if: -> { estado == 'resuelto' && saved_change_to_estado? }

  private
  
  def set_fecha()
    self.fecha ||= Time.current
  end

  def notify_incidencia_creada
    WebsocketNotifier.notify_nueva_incidencia(self)
  end

  def notify_estado_cambiado
    estado_anterior = saved_change_to_estado[0]
    WebsocketNotifier.notify_incidencia_estado_cambiado(self, estado_anterior)
  end

  def notify_asignada_a_moderador
    WebsocketNotifier.notify_incidencia_asignada(self) if moderador_id.present?
  end

  def notify_incidencia_resuelta
    WebsocketNotifier.notify_incidencia_resuelta(self)
  end
end

class Avance < ApplicationRecord
  before_create :set_fecha

  # Un avance pertence a un proyecto
  belongs_to :proyecto

  has_many :imagen_asociaciones, as: :asociable, dependent: :destroy
  has_many :imagenes, through: :imagen_asociaciones

  # Validaciones
  validates :descripcion, presence: true

  # Callbacks para WebSocket
  after_create :notify_avance_creado
  after_update :notify_avance_actualizado
  before_destroy :store_proyecto_id
  after_destroy :notify_avance_eliminado

  private
  
  def set_fecha()
    self.fecha ||= Time.current
  end

  def notify_avance_creado
    WebsocketNotifier.notify_nuevo_avance(self)
  end

  def notify_avance_actualizado
    WebsocketNotifier.notify_avance_actualizado(self)
  end

  def store_proyecto_id
    @proyecto_id_antes_destruir = proyecto_id
  end

  def notify_avance_eliminado
    WebsocketNotifier.notify_avance_eliminado(@proyecto_id_antes_destruir, id) if @proyecto_id_antes_destruir
  end
end

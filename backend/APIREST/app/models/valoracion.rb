class Valoracion < ApplicationRecord
  before_create :set_fecha
  after_create :update_proyecto_valoracion_promedio
  after_update :update_proyecto_valoracion_promedio
  after_destroy :update_proyecto_valoracion_promedio

  # Una valoracion le pertence a un cliente
  belongs_to :cliente

  # Una valoracion le pertenece a un proyecto
  belongs_to :proyecto

  # Validaciones
  validates :calificacion, :comentario, presence: true

  # Callbacks para WebSocket
  after_create :notify_valoracion_creada
  after_create :notify_promedio_actualizado
  after_update :notify_valoracion_actualizada
  after_update :notify_promedio_actualizado
  before_destroy :store_ids
  after_destroy :notify_valoracion_eliminada
  after_destroy :notify_promedio_actualizado_after_destroy

  private
  

  def set_fecha()
    self.fecha ||= Time.current
  end

  def notify_valoracion_creada
    WebsocketNotifier.notify_nueva_valoracion(self)
  end

  def notify_valoracion_actualizada
    WebsocketNotifier.notify_valoracion_actualizada(self)
  end

  def notify_promedio_actualizado
    return unless proyecto&.arquitecto
    
    # Recalcular el promedio
    arquitecto = proyecto.arquitecto
    promedio = arquitecto.proyectos.joins(:valoraciones)
                        .average('valoraciones.calificacion').to_f
    
    arquitecto.update_column(:valoracion_prom_proyecto, promedio)
    WebsocketNotifier.notify_valoracion_promedio_actualizado(arquitecto)
  end

  def store_ids
    @proyecto_id_antes_destruir = proyecto_id
    @arquitecto_id_antes_destruir = proyecto&.arquitecto_id
    @valoracion_id_antes_destruir = id
  end

  def notify_valoracion_eliminada
    if @proyecto_id_antes_destruir && @arquitecto_id_antes_destruir && @valoracion_id_antes_destruir
      WebsocketNotifier.notify_valoracion_eliminada(
        @proyecto_id_antes_destruir, 
        @arquitecto_id_antes_destruir, 
        @valoracion_id_antes_destruir
      )
    end
  end

  def notify_promedio_actualizado_after_destroy
    return unless @arquitecto_id_antes_destruir
    
    arquitecto = Arquitecto.find_by(id: @arquitecto_id_antes_destruir)
    return unless arquitecto
    
    # Recalcular el promedio
    promedio = arquitecto.proyectos.joins(:valoraciones)
                        .average('valoraciones.calificacion').to_f
    
    arquitecto.update_column(:valoracion_prom_proyecto, promedio)
    WebsocketNotifier.notify_valoracion_promedio_actualizado(arquitecto)
  end
  def update_proyecto_valoracion_promedio
    return unless proyecto

    # Calcular el promedio de todas las valoraciones del proyecto
    valoraciones = proyecto.valoraciones
    
    if valoraciones.any?
      promedio = valoraciones.average(:calificacion).to_f.round(2)
      proyecto.update(valoracion_promedio: promedio)
    else
      proyecto.update(valoracion_promedio: 0.0)
    end
  end
end

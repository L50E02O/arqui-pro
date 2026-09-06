class Api::V1::NotificacionesController < ApplicationController
  before_action :set_notificacion, only: %i[update show destroy]

  def index
    @notificaciones = Notificacion.all
    render json: @notificaciones
  end

  def create
    @notificacion = Notificacion.new(notificacion_params)
    if @notificacion.save
      render json: @notificacion, status: :created
    else
      render json: @notificacion.errors, status: :unprocessable_entity
    end
  end

  def show
    render json: @notificacion
  end

  def update
    if @notificacion.update(notificacion_params)
      render json: @notificacion
    else
      render json: @notificacion.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @notificacion
      @notificacion.destroy
      head :no_content  # responde con 204 No Content si se eliminó correctamente
    else
      render json: { error: "notificación no encontrado" }, status: :not_found
    end
  end

  # Marcar todas las notificaciones de un usuario como leídas
  def marcar_todas_leidas
    usuario_id = params[:usuario_id]
    
    if usuario_id.blank?
      return render json: { error: 'usuario_id es requerido' }, status: :bad_request
    end

    count = Notificacion.where(usuario_id: usuario_id, leido: false).update_all(leido: true)
    
    Rails.logger.info "✅ #{count} notificaciones marcadas como leídas para usuario #{usuario_id}"
    
    render json: { 
      success: true, 
      message: "#{count} notificaciones marcadas como leídas",
      count: count 
    }
  end

  private

  def notificacion_params
    params.require(:notificacion).permit(:mensaje, :fecha, :leido, :usuario_id)
  end

  def set_notificacion
    @notificacion = Notificacion.find_by(id: params[:id])
  end
end

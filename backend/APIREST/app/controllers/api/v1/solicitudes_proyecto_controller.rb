class Api::V1::SolicitudesProyectoController < ApplicationController
  before_action :set_solicitud, only: %i[update show destroy]

  # Solo usuarios autenticados pueden actualizar/eliminar
  # NOTA: create NO requiere autenticación para permitir chatbot AI
  before_action :authenticate_usuario!, only: %i[update destroy]
  # Solo usuarios propietarios pueden actualizar/eliminar
  before_action :require_solicitud_ownership!, only: %i[update destroy]

  def index
    @solicitudes= SolicitudProyecto.all
    render json: @solicitudes
  end

  def create
    @solicitud = SolicitudProyecto.new(solicitud_params)
    
    # Validar que al menos cliente_id esté presente
    if solicitud_params[:cliente_id].blank?
      render json: { error: "cliente_id es requerido" }, status: :unprocessable_entity
      return
    end
    
    if @solicitud.save
      render json: @solicitud, status: :created
    else
      render json: @solicitud.errors, status: :unprocessable_entity
    end
  end

  def show
    render json: @solicitud
  end

  def update
    if @solicitud.update(solicitud_params)
      render json: @solicitud
    else
      render json: @solicitud.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @solicitud
      @solicitud.destroy
      head :no_content  # responde con 204 No Content si se eliminó correctamente
    else
      render json: { error: "solicitud_proyecto no encontrado" }, status: :not_found
    end
  end

  private

  def solicitud_params
    params.require(:solicitud_proyecto).permit(:estado, :fecha, :arquitecto_id, :cliente_id)
  end

  def set_solicitud
    @solicitud = SolicitudProyecto.find_by(id: params[:id])
  end

  def require_solicitud_ownership!
    return not_found_response!("solicitud_proyecto") unless @solicitud
    unless @solicitud.cliente.usuario_id == current_usuario.id || @solicitud.arquitecto.usuario.id == current_usuario.id
      render json: { error: "No autorizado" }, status: :forbidden and return
    end
  end
end

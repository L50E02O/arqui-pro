class Api::V1::ValoracionesController < ApplicationController
  before_action :set_valoracion, only: %i[update show destroy]

  # Solo usuarios autenticados pueden crear/actualizar/eliminar
  before_action :authenticate_usuario!, only: %i[create update destroy]
  # Solo usuarios propietarios pueden actualizar/eliminar
  before_action :require_valoracion_ownership!, only: %i[update destroy]

  def index
    @valoraciones = if params[:proyecto_id]
                      Valoracion.where(proyecto_id: params[:proyecto_id])
                    elsif params[:cliente_id]
                      Valoracion.where(cliente_id: params[:cliente_id])
                    else
                      Valoracion.all
                    end

    @valoraciones = @valoraciones.includes(cliente: :usuario, proyecto: :arquitecto)

    render json: @valoraciones.as_json(
      include: {
        cliente: {
          include: {
            usuario: { only: [:id, :nombre, :apellido, :email] }
          }
        },
        proyecto: { only: [:id, :titulo_proyecto, :tipo_proyecto] }
      }
    )
  end

  def create
    @valoracion = Valoracion.new(valoracion_params)
    if @valoracion.save
      render json: @valoracion, status: :created
    else
      render json: @valoracion.errors, status: :unprocessable_entity
    end
  end

  def show
    render json: @valoracion.as_json(
      include: {
        cliente: {
          include: {
            usuario: { only: [:id, :nombre, :apellido, :email] }
          }
        },
        proyecto: { only: [:id, :titulo_proyecto, :tipo_proyecto] }
      }
    )
  end

  def update
    if @valoracion.update(valoracion_params)
      render json: @valoracion
    else
      render json: @valoracion.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @valoracion
      @valoracion.destroy
      head :no_content  # responde con 204 No Content si se eliminó correctamente
    else
      render json: { error: "valoracion no encontrado" }, status: :not_found
    end
  end

  private

  def valoracion_params
    params.require(:valoracion).permit(:calificacion, :comentario, :fecha, :cliente_id, :proyecto_id)
  end

  def set_valoracion
    @valoracion = Valoracion.find_by(id: params[:id])
  end

  def require_valoracion_ownership!
    return not_found_response!("valoracion") unless @valoracion
    unless @valoracion.cliente.usuario.id == current_usuario.id
      render json: { error: "No autorizado" }, status: :forbidden and return
    end
  end
end

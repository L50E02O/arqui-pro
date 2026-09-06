class Api::V1::ImagenAsociacionesController < ApplicationController
  before_action :set_imagen_asociacion, only: %i[update show destroy]

  def index
    @imagen_asociaciones = ImagenAsociacion.all
    render json: @imagen_asociaciones
  end

  def create
    @imagen_asociacion = ImagenAsociacion.new(imagen_asociacion_params)
    if @imagen_asociacion.save
      render json: @imagen_asociacion, status: :created
    else
      render json: @imagen_asociacion.errors, status: :unprocessable_entity
    end
  end

  def show
    render json: @imagen_asociacion
  end

  def update
    if @imagen_asociacion.update(imagen_asociacion_params)
      render json: @imagen_asociacion
    else
      render json: @imagen_asociacion.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @imagen_asociacion
      @imagen_asociacion.destroy
      head :no_content  # responde con 204 No Content si se eliminó correctamente
    else
      render json: { error: "imagen_asociacion no encontrado" }, status: :not_found
    end
  end

  private

  def imagen_asociacion_params
    params.require(:imagen_asociacion).permit(:imagen_id, :asociable_id, :asociable_type)
  end

  def set_imagen_asociacion
    @imagen_asociacion = ImagenAsociacion.find_by(id: params[:id])
  end
end

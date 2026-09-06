class Api::V1::ImagenesController < ApplicationController
  before_action :set_imagen, only: %i[update show destroy]

  # Solo usuarios autenticados pueden crear/actualizar/eliminar
  before_action :authenticate_usuario!, only: %i[create update destroy]

  def index
    @imagenes = Imagen.all
    render json: @imagenes
  end

  def create
    @imagen = Imagen.new(imagen_params)
    if @imagen.save
      render json: @imagen, status: :created
    else
      render json: @imagen.errors, status: :unprocessable_entity
    end
  end

  def show
    render json: @imagen
  end

  def update
    if @imagen.update(imagen_params)
      render json: @imagen
    else
      render json: @imagen.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @imagen
      @imagen.destroy
      head :no_content  # responde con 204 No Content si se eliminó correctamente
    else
      render json: { error: "imagen no encontrado" }, status: :not_found
    end
  end

  private

  def imagen_params
    params.require(:imagen).permit(:imagen_url, :fecha, imagen_asociaciones_attributes: [ :asociable_type, :asociable_id ])
  end

  def set_imagen
    @imagen = Imagen.find_by(id: params[:id])
  end
end

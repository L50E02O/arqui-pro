class Api::V1::AvancesController < ApplicationController
  before_action :set_avance, only: %i[update show destroy]
  # Permitir create sin autenticación para chatbot AI
  # Solo arquitectos autenticados pueden actualizar/eliminar
  before_action :authenticate_usuario!, only: %i[update destroy]
  before_action :require_arquitecto!, only: %i[update destroy]
  before_action :require_avance_ownership!, only: %i[update destroy]

  def index
    if params[:proyecto_id].present?
      @avances = Avance.where(proyecto_id: params[:proyecto_id])
                       .includes(:imagenes)
                       .order(fecha: :desc)
    else
      @avances = Avance.includes(:imagenes).all
    end
    
    render json: @avances.as_json(
      include: {
        imagenes: { only: [:id, :imagen_url, :fecha] }
      }
    )
  end

  def create
    # Verificar que el proyecto existe
    proyecto = Proyecto.find_by(id: avance_params[:proyecto_id])
    
    unless proyecto
      render json: { error: "Proyecto no encontrado" }, status: :not_found
      return
    end
    
    # Solo validar ownership si hay autenticación (viene de UI)
    # Si no hay autenticación, asumir que viene del chatbot AI
    if current_arquitecto.present?
      Rails.logger.info "🔒 [AVANCE CREATE] Proyecto arquitecto_id: #{proyecto.arquitecto_id}, Current arquitecto_id: #{current_arquitecto&.id}"
      
      # Verificar que el arquitecto actual es el dueño del proyecto
      unless proyecto.arquitecto_id == current_arquitecto&.id
        Rails.logger.error "    ❌ No autorizado: Arquitecto no es dueño del proyecto"
        render json: { error: "No autorizado para crear avances en este proyecto" }, status: :forbidden
        return
      end
      
      Rails.logger.info "    ✅ Autorizado: Creando avance para proyecto #{proyecto.id}"
    else
      Rails.logger.info "🤖 [AVANCE CREATE] Creación desde chatbot AI para proyecto #{proyecto.id}"
    end

    @avance = Avance.new(avance_params)
    if @avance.save
      # Si hay imágenes, crear las asociaciones
      if params[:imagenes].present?
        params[:imagenes].each do |imagen_data|
          imagen = Imagen.create!(
            imagen_url: imagen_data[:url],
            fecha: Time.current
          )
          ImagenAsociacion.create!(
            imagen: imagen,
            asociable: @avance
          )
        end
        # Recargar el avance con las imágenes
        @avance.reload
      end
      
      render json: @avance.as_json(
        include: {
          imagenes: { only: [:id, :imagen_url, :fecha] }
        }
      ), status: :created
    else
      render json: @avance.errors, status: :unprocessable_entity
    end
  end

  def show
    render json: @avance.as_json(
      include: {
        imagenes: { only: [:id, :imagen_url, :fecha] }
      }
    )
  end

  def update
    if @avance.update(avance_params)
      render json: @avance
    else
      render json: @avance.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @avance
      @avance.destroy
      head :no_content  # responde con 204 No Content si se eliminó correctamente
    else
      render json: { error: "avance no encontrado" }, status: :not_found
    end
  end

  private

  def avance_params
    params.require(:avance).permit(:descripcion, :fecha, :proyecto_id, imagenes_attributes: [:url, :fecha])
  end

  def set_avance
    @avance = Avance.find_by(id: params[:id])
  end

  def require_avance_ownership!
    return not_found_response!("avance") unless @avance
    
    Rails.logger.info "🔒 [AVANCE OWNERSHIP] Proyecto arquitecto_id: #{@avance.proyecto.arquitecto_id}, Current arquitecto_id: #{current_arquitecto&.id}"
    
    unless @avance.proyecto.arquitecto_id == current_arquitecto&.id
      Rails.logger.error "    ❌ No autorizado: IDs no coinciden"
      render json: { error: "No autorizado" }, status: :forbidden and return
    end
    
    Rails.logger.info "    ✅ Autorizado: Arquitecto es dueño del avance"
  end

end

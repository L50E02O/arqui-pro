class Api::V1::ProyectosController < ApplicationController
  before_action :set_proyecto, only: %i[update show destroy add_imagenes]

  # Permitir create sin autenticación para chatbot AI
  # Solo arquitectos autenticados pueden actualizar/eliminar/add_imagenes
  before_action :authenticate_usuario!, only: %i[update destroy add_imagenes]
  # Solo arquitectos pueden eliminar y agregar imágenes
  before_action :require_arquitecto!, only: %i[destroy add_imagenes]
  # Solo arquitecto dueño pueden actualizar/eliminar
  before_action :require_proyecto_ownership!, only: %i[update destroy add_imagenes]

  def index
    @proyectos = Proyecto.includes(:arquitecto, :cliente, :imagenes).all
    
    # Filtrar por tipo_proyecto si se proporciona
    if params[:tipo_proyecto].present?
      @proyectos = @proyectos.where(tipo_proyecto: params[:tipo_proyecto])
    end
    
    render json: @proyectos.as_json(
      include: {
        arquitecto: {
          include: {
            usuario: { only: [:id, :nombre, :apellido] }
          }
        },
        cliente: {
          include: {
            usuario: { only: [:id, :nombre, :apellido] }
          }
        },
        imagenes: { only: [:id, :imagen_url] }
      }
    )
  end

  def create
    @proyecto = Proyecto.new(proyecto_params)
    if @proyecto.save
      Rails.logger.info "✅ Proyecto creado: #{@proyecto.id} - #{@proyecto.titulo_proyecto}"
      
      # Notificar al cliente si el proyecto es de tipo 'contratado'
      if @proyecto.tipo_proyecto == 'contratado' && @proyecto.cliente_id.present?
        begin
          NotificationService.notify_proyecto_creado(@proyecto)
        rescue => e
          Rails.logger.error "❌ Error al notificar proyecto creado: #{e.message}"
        end
      end
      
      render json: @proyecto, status: :created
    else
      render json: @proyecto.errors, status: :unprocessable_entity
    end
  end

  def show
    Rails.logger.info "🔍 [SHOW PROYECTO] ID solicitado: #{params[:id]}"
    Rails.logger.info "   Proyecto encontrado: #{@proyecto.present?}"
    
    if @proyecto
      Rails.logger.info "   ✅ Proyecto: #{@proyecto.titulo_proyecto}"
      Rails.logger.info "   Imágenes: #{@proyecto.imagenes.count}"
      
      render json: @proyecto.as_json(
        include: {
          imagenes: { only: [:id, :imagen_url, :fecha] }
        }
      )
    else
      Rails.logger.error "   ❌ Proyecto no encontrado con ID: #{params[:id]}"
      render json: { error: "Proyecto no encontrado" }, status: :not_found
    end
  end

  def update
    if @proyecto.update(proyecto_params)
      render json: @proyecto
    else
      render json: @proyecto.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @proyecto
      @proyecto.destroy
      head :no_content  # responde con 204 No Content si se eliminó correctamente
    else
      render json: { error: "proyecto no encontrado" }, status: :not_found
    end
  end

  def add_imagenes
    imagenes_params = params[:imagenes]
    
    if imagenes_params.blank?
      render json: { error: "No se proporcionaron imágenes" }, status: :unprocessable_entity
      return
    end

    begin
      imagenes_params.each do |imagen_data|
        imagen = Imagen.new(imagen_url: imagen_data, fecha: Time.current)
        if imagen.save
          ImagenAsociacion.create!(
            imagen_id: imagen.id,
            imageable_id: @proyecto.id,
            imageable_type: 'Proyecto'
          )
        end
      end

      # Recargar el proyecto con las imágenes
      @proyecto.reload
      
      render json: @proyecto.as_json(
        include: {
          imagenes: { only: [:id, :imagen_url, :fecha] }
        }
      )
    rescue => e
      render json: { error: "Error al agregar imágenes: #{e.message}" }, status: :unprocessable_entity
    end
  end

  private

  def proyecto_params
    params.require(:proyecto).permit(
      :titulo_proyecto, 
      :valoracion_promedio, 
      :descripcion, 
      :tipo_proyecto, 
      :fecha_publicacion, 
      :arquitecto_id,
      :conversacion_id, 
      :cliente_id, 
      :solicitud_proyecto_id
    )
  end

  def set_proyecto
    @proyecto = Proyecto.find_by(id: params[:id])
  end  

  def require_proyecto_ownership!
    return not_found_response!("proyecto") unless @proyecto
    
    Rails.logger.info "🔒 [PROYECTO OWNERSHIP] Proyecto arquitecto_id: #{@proyecto.arquitecto_id}, cliente_id: #{@proyecto.cliente_id}, Current arquitecto_id: #{current_arquitecto&.id}, Current cliente_id: #{current_cliente&.id}"

    # Permitir acción si el arquitecto autenticado es dueño del proyecto
    # o si el cliente autenticado es el dueño del proyecto
    unless @proyecto.arquitecto_id == current_arquitecto&.id || @proyecto.cliente_id == current_cliente&.id
      Rails.logger.error "    ❌ No autorizado: ni arquitecto ni cliente coinciden con el propietario"
      render json: { error: "No autorizado" }, status: :forbidden
      return
    end

    Rails.logger.info "    ✅ Autorizado: propietario (arquitecto o cliente) coincide con el proyecto"
  end


end

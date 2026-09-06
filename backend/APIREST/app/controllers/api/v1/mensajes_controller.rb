class Api::V1::MensajesController < ApplicationController
  before_action :set_mensaje, only: %i[update show destroy]

  # Solo usuarios autenticados pueden crear/actualizar/eliminar
  #before_action :authenticate_usuario!, only: %i[create update destroy]
  #before_action :require_mensaje_ownership!, only: %i[update destroy]

  def index
    @mensajes = Mensaje.includes(:imagenes, :remitente).all
    render json: @mensajes.as_json(
      include: {
        remitente: { only: [:id, :nombre, :email] },
        imagenes: { only: [:id, :imagen_url, :fecha] }
      }
    )
  end

  def create
    # Validar que haya contenido o imágenes
    if mensaje_params[:contenido].blank? && params[:imagenes].blank?
      render json: { error: "Debe proporcionar contenido o al menos una imagen" }, status: :unprocessable_entity
      return
    end
    
    @mensaje = Mensaje.new(mensaje_params)
    if @mensaje.save
      # Si hay imágenes, crear las asociaciones
      if params[:imagenes].present?
        params[:imagenes].each do |imagen_data|
          imagen = Imagen.create!(
            imagen_url: imagen_data[:url],
            fecha: Time.current
          )
          ImagenAsociacion.create!(
            imagen: imagen,
            asociable: @mensaje
          )
        end
        # Recargar el mensaje con las imágenes
        @mensaje.reload
      end
      
      # Notificar sobre el nuevo mensaje (crea notificación en BD y envía WebSocket)
      begin
        NotificationService.notify_nuevo_mensaje(@mensaje)
        Rails.logger.info "✅ Notificación enviada para mensaje #{@mensaje.id}"
      rescue => e
        Rails.logger.error "❌ Error al notificar mensaje: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
      end
      
      # Serializar con imágenes
      render json: @mensaje.as_json(include: { imagenes: { only: [:id, :imagen_url, :fecha] } }), status: :created
    else
      render json: @mensaje.errors, status: :unprocessable_entity
    end
  end

  def show
    render json: @mensaje.as_json(
      include: {
        remitente: { only: [:id, :nombre, :email] },
        imagenes: { only: [:id, :imagen_url, :fecha] }
      }
    )
  end

  def update
    if @mensaje.update(mensaje_params)
      render json: @mensaje
    else
      render json: @mensaje.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @mensaje
      @mensaje.destroy
      head :no_content  # responde con 204 No Content si se eliminó correctamente
    else
      render json: { error: "notificación no encontrado" }, status: :not_found
    end
  end

  private

  def mensaje_params
    params.require(:mensaje).permit(:contenido, :fecha_envio, :leido, :remitente_id, :conversacion_id, :hora_envio)
  end

  def set_mensaje
    @mensaje = Mensaje.find_by(id: params[:id])
  end

  def require_mensaje_ownership!
    return not_found_response!("mensaje") unless @mensaje
    unless @mensaje.remitente_id == current_usuario.id
      render json: { error: "No autorizado" }, status: :forbidden and return
    end
  end
end

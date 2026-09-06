class Api::V1::VerificacionesController < ApplicationController
  before_action :set_verificacion, only: %i[update show destroy aprobar rechazar]

  def index
    @verificaciones = Verificacion.includes(arquitecto: :usuario, moderador: :usuario).all
    
    # Filtrar por estado si se proporciona
    if params[:estado].present? && params[:estado] != 'todos'
      @verificaciones = @verificaciones.where(estado: params[:estado])
    end
    
    # Paginación
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 10
    
    total = @verificaciones.count
    @verificaciones = @verificaciones.offset((page - 1) * per_page).limit(per_page)
    
    render json: {
      verificaciones: @verificaciones.as_json(include: {
        arquitecto: { include: :usuario },
        moderador: { include: :usuario }
      }),
      total: total,
      page: page,
      per_page: per_page
    }
  end

  def create
    @verificacion = Verificacion.new(verificacion_params)
    if @verificacion.save
      render json: @verificacion, status: :created
    else
      render json: @verificacion.errors, status: :unprocessable_entity
    end
  end

  def show
    render json: @verificacion
  end

  def update
    if @verificacion.update(verificacion_params)
      render json: @verificacion
    else
      render json: @verificacion.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @verificacion
      @verificacion.destroy
      head :no_content  # responde con 204 No Content si se eliminó correctamente
    else
      render json: { error: "verificación no encontrada" }, status: :not_found
    end
  end

  # Aprobar verificación
  def aprobar
    # Buscar el moderador por usuario_id
    moderador = Moderador.find_by(usuario_id: params[:moderador_id])
    
    unless moderador
      return render json: { 
        status: 'error', 
        message: 'Moderador no encontrado' 
      }, status: :not_found
    end
    
    ActiveRecord::Base.transaction do
      # Actualizar la verificación
      @verificacion.update!(
        estado: 'verificado',
        moderador_id: moderador.id,
        fecha_verificacion: DateTime.now
      )
      
      # Actualizar el campo verificado en arquitectos
      @verificacion.arquitecto.update!(verificado: true)
      
      # Notificar al arquitecto que fue verificado vía notificación
      begin
        NotificationService.notify_arquitecto_verificado(@verificacion.arquitecto)
        Rails.logger.info "✅ Notificación guardada para el arquitecto #{@verificacion.arquitecto.id}"
      rescue => e
        Rails.logger.error "❌ Error al crear notificación: #{e.message}"
      end
      
      # Emitir evento WebSocket para actualizar dashboard en tiempo real
      begin
        WebsocketNotifier.notify_arquitecto_verificado(@verificacion.arquitecto, @verificacion.id, moderador.id)
        Rails.logger.info "✅ Evento WebSocket enviado para verificación"
      rescue => e
        Rails.logger.error "❌ Error al enviar evento WebSocket: #{e.message}"
      end
      
      # Incrementar contador del moderador
      moderador.increment!(:num_arquitectos_verificados)
    end
    
    render json: { 
      status: 'success', 
      message: 'Verificación aprobada correctamente',
      verificacion: @verificacion 
    }, status: :ok
  rescue ActiveRecord::RecordInvalid => e
    render json: { 
      status: 'error', 
      errors: e.record.errors.full_messages 
    }, status: :unprocessable_entity
  rescue ActiveRecord::RecordNotFound
    render json: { 
      status: 'error', 
      message: 'Verificación no encontrada' 
    }, status: :not_found
  end

  # Rechazar verificación
  def rechazar
    # Buscar el moderador por usuario_id
    moderador = Moderador.find_by(usuario_id: params[:moderador_id])
    
    unless moderador
      return render json: { 
        status: 'error', 
        message: 'Moderador no encontrado' 
      }, status: :not_found
    end
    
    ActiveRecord::Base.transaction do
      # Actualizar la verificación
      @verificacion.update!(
        estado: 'rechazado',
        moderador_id: moderador.id,
        fecha_verificacion: DateTime.now
      )
      
      # Asegurar que el campo verificado sea false en arquitectos
      @verificacion.arquitecto.update!(verificado: false)
      
      # Notificar al arquitecto que fue rechazado
      WebsocketNotifier.notify_arquitecto_rechazado(@verificacion.arquitecto)
    end
    
    render json: { 
      status: 'success', 
      message: 'Verificación rechazada',
      verificacion: @verificacion 
    }, status: :ok
  rescue ActiveRecord::RecordInvalid => e
    render json: { 
      status: 'error', 
      errors: e.record.errors.full_messages 
    }, status: :unprocessable_entity
  rescue ActiveRecord::RecordNotFound
    render json: { 
      status: 'error', 
      message: 'Verificación no encontrada' 
    }, status: :not_found
  end

  private

  def verificacion_params
    params.permit(:estado, :fecha_verificacion, :arquitecto_id, :moderador_id, :comentarios)
  end

  def set_verificacion
    @verificacion = Verificacion.find_by(id: params[:id])
  end
end

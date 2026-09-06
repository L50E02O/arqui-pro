class Api::V1::ConversacionesController < ApplicationController
  before_action :set_conversacion, only: %i[update show destroy]

  # Solo usuarios autenticados pueden crear/actualizar/eliminar
  before_action :authenticate_usuario!, only: %i[create update destroy]

  def index
    usuario_id = params[:usuario_id] || request.headers['X-User-ID']
    
    Rails.logger.info "\n� [INDEX] Solicitud de conversaciones"
    Rails.logger.info "   usuario_id (params): #{params[:usuario_id]}"
    Rails.logger.info "   X-User-ID (header): #{request.headers['X-User-ID']}"
    Rails.logger.info "   usuario_id final: #{usuario_id}"
    
    if usuario_id.present?
      # 🔒 FILTRAR conversaciones por usuario autenticado
      arquitecto = Arquitecto.find_by(usuario_id: usuario_id)
      cliente = Cliente.find_by(usuario_id: usuario_id)
      
      Rails.logger.info "   Arquitecto encontrado: #{arquitecto&.id}"
      Rails.logger.info "   Cliente encontrado: #{cliente&.id}"
      
      if arquitecto
        @conversaciones = Conversacion.where(arquitecto_id: arquitecto.id)
                                      .includes(cliente: :usuario, arquitecto: :usuario)
        Rails.logger.info "✅ Filtrando conversaciones para arquitecto #{arquitecto.id}: #{@conversaciones.count} conversaciones"
        Rails.logger.info "   IDs: #{@conversaciones.pluck(:id).join(', ')}"
      elsif cliente
        @conversaciones = Conversacion.where(cliente_id: cliente.id)
                                      .includes(cliente: :usuario, arquitecto: :usuario)
        Rails.logger.info "✅ Filtrando conversaciones para cliente #{cliente.id}: #{@conversaciones.count} conversaciones"
        Rails.logger.info "   IDs: #{@conversaciones.pluck(:id).join(', ')}"
      else
        Rails.logger.warn "⚠️ Usuario #{usuario_id} no es ni arquitecto ni cliente"
        @conversaciones = []
      end
    else
      Rails.logger.warn "⚠️ Petición sin usuario_id - devolviendo array vacío"
      @conversaciones = []
    end
    
    render json: @conversaciones.as_json(
      include: {
        cliente: { include: :usuario },
        arquitecto: { include: :usuario }
      }
    )
  end

  def create
    Rails.logger.info "\n📝 [CREATE] Creando conversación"
    Rails.logger.info "   Params recibidos: #{conversacion_params.inspect}"
    
    # Verificar si ya existe una conversación entre estos participantes
    conversacion_existente = Conversacion.find_by(
      cliente_id: conversacion_params[:cliente_id],
      arquitecto_id: conversacion_params[:arquitecto_id]
    )
    
    if conversacion_existente
      Rails.logger.info "✅ Conversación ya existe: #{conversacion_existente.id}"
      render json: { 
        conversacion: conversacion_existente.as_json(
          include: {
            cliente: { include: :usuario },
            arquitecto: { include: :usuario }
          }
        ),
        message: 'Ya existe una conversación con este arquitecto',
        existing: true
      }, status: :ok
      return
    end
    
    @conversacion = Conversacion.new(conversacion_params)
    
    if @conversacion.save
      Rails.logger.info "✅ Conversación creada exitosamente: #{@conversacion.id}"
      
      # Notificar sobre la nueva conversación (envía WebSocket)
      begin
        NotificationService.notify_conversacion_creada(@conversacion)
        Rails.logger.info "✅ Notificación WebSocket enviada para conversación #{@conversacion.id}"
      rescue => e
        Rails.logger.error "❌ Error al notificar conversación: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
      end
      
      render json: { 
        conversacion: @conversacion.as_json(
          include: {
            cliente: { include: :usuario },
            arquitecto: { include: :usuario }
          }
        ),
        message: 'Conversación creada exitosamente',
        existing: false
      }, status: :created
    else
      Rails.logger.error "❌ Error al crear conversación: #{@conversacion.errors.full_messages.join(', ')}"
      render json: { 
        error: 'No se pudo crear la conversación',
        details: @conversacion.errors.full_messages 
      }, status: :unprocessable_entity
    end
  end

  def show
    render json: @conversacion
  end

  def update
    if @conversacion.update(conversacion_params)
      render json: @conversacion
    else
      render json: @conversacion.errors, status: :unprocessable_entity
    end
  end

  def destroy
    Rails.logger.info "\n🗑️ [DELETE] Eliminando conversación #{params[:id]}"
    
    if @conversacion
      # Eliminar todos los mensajes asociados (cascade delete configurado en el modelo)
      Rails.logger.info "   Eliminando #{@conversacion.mensajes.count} mensajes..."
      
      @conversacion.destroy
      Rails.logger.info "✅ Conversación eliminada exitosamente"
      
      render json: { 
        success: true,
        message: 'Conversación eliminada exitosamente' 
      }, status: :ok
    else
      Rails.logger.error "❌ Conversación no encontrada: #{params[:id]}"
      render json: { error: "Conversación no encontrada" }, status: :not_found
    end
  end

  def mensajes
    @conversacion = Conversacion.find_by(id: params[:id])
    
    Rails.logger.info "\n🔍 [MENSAJES] Solicitud de mensajes para conversación #{params[:id]}"
    Rails.logger.info "   Headers: #{request.headers.to_h.select { |k, v| k.start_with?('X-') }}"
    Rails.logger.info "   Params: #{params.inspect}"
    
    if @conversacion
      Rails.logger.info "✅ Conversación encontrada, devolviendo mensajes (validación deshabilitada temporalmente)"
      @mensajes = @conversacion.mensajes.includes(:remitente, :imagenes).order(fecha_envio: :asc)
      
      # Incluir datos del remitente (usuario) y las imágenes en la respuesta
      render json: @mensajes.as_json(
        include: {
          remitente: { only: [:id, :nombre, :email] },
          imagenes: { only: [:id, :imagen_url, :fecha] }
        }
      )
    else
      Rails.logger.error "❌ Conversación #{params[:id]} no encontrada"
      render json: { error: "Conversación no encontrada" }, status: :not_found
    end
  end

  # VERSIÓN CON VALIDACIÓN (comentada temporalmente para debugging)
  # def mensajes
  #   @conversacion = Conversacion.find_by(id: params[:id])
  #   
  #   if @conversacion
  #     usuario_id = request.headers['X-User-ID'] || request.headers['HTTP_X_USER_ID'] || params[:usuario_id]
  #     
  #     if usuario_id.blank?
  #       render json: { error: "No autorizado" }, status: :unauthorized
  #       return
  #     end
  #     
  #     arquitecto = Arquitecto.find_by(usuario_id: usuario_id)
  #     cliente = Cliente.find_by(usuario_id: usuario_id)
  #     
  #     es_arquitecto_conversacion = arquitecto && @conversacion.arquitecto_id == arquitecto.id
  #     es_cliente_conversacion = cliente && @conversacion.cliente_id == cliente.id
  #     
  #     unless es_arquitecto_conversacion || es_cliente_conversacion
  #       render json: { error: "No autorizado" }, status: :forbidden
  #       return
  #     end
  #     
  #     @mensajes = @conversacion.mensajes.order(fecha_envio: :asc)
  #     render json: @mensajes
  #   else
  #     render json: { error: "Conversación no encontrada" }, status: :not_found
  #   end
  # end

  def marcar_mensajes_leidos
    @conversacion = Conversacion.find_by(id: params[:id])
    if @conversacion
      usuario_id = params[:usuario_id]
      if usuario_id
        mensajes_actualizados = @conversacion.mensajes
                                             .where.not(remitente_id: usuario_id)
                                             .where(leido: false)
                                             .update_all(leido: true)
        
        render json: { 
          success: true, 
          mensajes_actualizados: mensajes_actualizados,
          conversacion_id: @conversacion.id,
          usuario_id: usuario_id
        }
      else
        render json: { error: "usuario_id es requerido" }, status: :unprocessable_entity
      end
    else
      render json: { error: "Conversación no encontrada" }, status: :not_found
    end
  end

  private

  def conversacion_params
    params.require(:conversacion).permit(:fecha, :cliente_id, :arquitecto_id)
  end

  def set_conversacion
    @conversacion = Conversacion.find_by(id: params[:id])
  end
end

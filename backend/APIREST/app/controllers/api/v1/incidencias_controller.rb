class Api::V1::IncidenciasController < ApplicationController
  before_action :set_incidencia, only: %i[update show destroy resolver reabrir]

  # Solo usuarios autenticados pueden crear/actualizar/eliminar
  before_action :authenticate_usuario!, only: %i[create update destroy]
  # Solo usuarios propietarios y moderadores pueden actualizar/eliminar
  before_action :require_incidencia_ownership!, only: %i[update destroy]

  def index
    @incidencias = Incidencia.includes(:usuario_emisor, :usuario_infractor, :imagenes, moderador: [:usuario]).all
    
    # Filtrar por estado si se proporciona
    if params[:estado].present? && params[:estado] != 'todos'
      @incidencias = @incidencias.where(estado: params[:estado])
    end
    
    # Paginación
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 10
    
    total = @incidencias.count
    @incidencias = @incidencias.offset((page - 1) * per_page).limit(per_page)
    
    # Serializar manualmente para incluir emisor e infractor
    incidencias_json = @incidencias.map do |incidencia|
      {
        id: incidencia.id,
        descripcion: incidencia.descripcion,
        estado: incidencia.estado,
        fecha: incidencia.fecha,
        emisor_id: incidencia.usuario_emisor_id,
        infractor_id: incidencia.usuario_infractor_id,
        moderador_id: incidencia.moderador_id,
        imagenes: incidencia.imagenes.map { |img| { id: img.id, imagen_url: img.imagen_url, fecha: img.fecha } },
        emisor: incidencia.usuario_emisor ? {
          id: incidencia.usuario_emisor.id,
          nombre: incidencia.usuario_emisor.nombre,
          apellido: incidencia.usuario_emisor.apellido,
          email: incidencia.usuario_emisor.email,
          estado_cuenta: incidencia.usuario_emisor.estado_cuenta
        } : nil,
        infractor: incidencia.usuario_infractor ? {
          id: incidencia.usuario_infractor.id,
          nombre: incidencia.usuario_infractor.nombre,
          apellido: incidencia.usuario_infractor.apellido,
          email: incidencia.usuario_infractor.email,
          estado_cuenta: incidencia.usuario_infractor.estado_cuenta
        } : nil,
        moderador: incidencia.moderador ? {
          usuario: {
            nombre: incidencia.moderador.usuario.nombre,
            apellido: incidencia.moderador.usuario.apellido
          }
        } : nil
      }
    end
    
    render json: {
      incidencias: incidencias_json,
      total: total,
      page: page,
      per_page: per_page
    }
  end

  def create
    # Asignar un moderador aleatorio de los que existen en la base de datos
    moderadores = Moderador.pluck(:id)
    if moderadores.empty?
      return render json: { error: 'No hay moderadores disponibles' }, status: :unprocessable_entity
    end
    
    moderador_id = moderadores.sample
    
    # Crear incidencia con moderador aleatorio
    incidencia_params_with_moderador = incidencia_params.merge(moderador_id: moderador_id)
    @incidencia = Incidencia.new(incidencia_params_with_moderador)
    
    if @incidencia.save
      render json: @incidencia, status: :created
    else
      render json: @incidencia.errors, status: :unprocessable_entity
    end
  end

  def show
    render json: @incidencia
  end

  def update
    if @incidencia.update(incidencia_params)
      render json: @incidencia
    else
      render json: @incidencia.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @incidencia
      @incidencia.destroy
      head :no_content  # responde con 204 No Content si se eliminó correctamente
    else
      render json: { error: "incidencia no encontrado" }, status: :not_found
    end
  end

  # Resolver incidencia
  def resolver
    # Buscar el moderador por usuario_id
    moderador = Moderador.find_by(usuario_id: params[:moderador_id])
    
    unless moderador
      return render json: { 
        status: 'error', 
        message: 'Moderador no encontrado' 
      }, status: :not_found
    end
    
    ActiveRecord::Base.transaction do
      # Actualizar la incidencia
      @incidencia.update!(
        estado: 'resuelto',
        moderador_id: moderador.id
      )
      
      # Incrementar contador del moderador
      moderador.increment!(:num_incidencias_resueltas)
    end
    
    render json: { 
      status: 'success', 
      message: 'Incidencia resuelta correctamente',
      incidencia: @incidencia 
    }, status: :ok
  rescue ActiveRecord::RecordInvalid => e
    render json: { 
      status: 'error', 
      errors: e.record.errors.full_messages 
    }, status: :unprocessable_entity
  rescue ActiveRecord::RecordNotFound
    render json: { 
      status: 'error', 
      message: 'Incidencia no encontrada' 
    }, status: :not_found
  end

  # Reabrir incidencia (cambiar estado a "pendiente")
  def reabrir
    # Buscar el moderador por usuario_id
    moderador = Moderador.find_by(usuario_id: params[:moderador_id])
    
    unless moderador
      return render json: { 
        status: 'error', 
        message: 'Moderador no encontrado' 
      }, status: :not_found
    end
    
    # Solo se pueden reabrir incidencias resueltas
    unless @incidencia.estado == 'resuelto'
      return render json: { 
        status: 'error', 
        message: 'Solo se pueden reabrir incidencias resueltas' 
      }, status: :unprocessable_entity
    end
    
    if @incidencia.update(estado: 'pendiente')
      render json: { 
        status: 'success', 
        message: 'Incidencia reabierta y marcada como pendiente',
        incidencia: @incidencia 
      }, status: :ok
    else
      render json: { 
        status: 'error', 
        errors: @incidencia.errors.full_messages 
      }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { 
      status: 'error', 
      message: 'Incidencia no encontrada' 
    }, status: :not_found
  end

  private

  def incidencia_params
    params.permit(:descripcion, :estado, :fecha, :usuario_emisor_id, :usuario_infractor_id, :moderador_id)
  end

  def set_incidencia
    @incidencia = Incidencia.find_by(id: params[:id])
  end

  def require_incidencia_ownership!
    return not_found_response!("incidencia") unless @incidencia
    unless @incidencia.usuario_emisor_id == current_usuario.id || @incidencia.moderador_id == current_usuario.id
      render json: { error: "No autorizado" }, status: :forbidden and return
    end
  end
end

class ApplicationController < ActionController::API
  include Devise::Controllers::Helpers
  respond_to :json

  before_action :configure_permitted_parameters, if: :devise_controller?

  # Struct to represent authenticated user from JWT (not from database)
  CurrentUser = Struct.new(:id, :email, :rol, :nombre, :apellido, keyword_init: true) do
    def arquitecto?
      rol == 'arquitecto'
    end

    def cliente?
      rol == 'cliente'
    end

    def moderador?
      rol == 'moderador'
    end
  end

  def current
    render json: current_usuario
  end

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_in, keys: [:email, :password])
    devise_parameter_sanitizer.permit(:sign_up, keys: [:email, :password, :nombre, :apellido, :rol])
  end

  private

  def authenticate_usuario!
    token = request.headers['Authorization']&.split(' ')&.last
    
    Rails.logger.info "🔐 [AUTH] Request to: #{request.path}"
    Rails.logger.info "    Token present: #{token.present?}"
    
    unless token
      Rails.logger.error "    ❌ No se proporcionó token de autorización"
      render json: { error: 'Token de autorización requerido' }, status: :unauthorized
      return
    end

    begin
      # Decode and validate JWT with shared secret
      payload = JWT.decode(
        token, 
        JWT_SECRET_KEY, 
        true, 
        { 
          algorithm: JWT_ALGORITHM,
          verify_iss: true,
          iss: JWT_ISSUER
        }
      ).first
      
      Rails.logger.info "    ✅ Token válido - Usuario: #{payload['email']} (#{payload['rol']})"
      
      # Create CurrentUser from JWT payload (no database lookup)
      @current_usuario = CurrentUser.new(
        id: payload['sub'],
        email: payload['email'],
        rol: payload['rol'],
        nombre: nil,  # Not included in JWT, can be fetched separately if needed
        apellido: nil
      )
      
      Rails.logger.info "    ✅ CurrentUser creado: #{@current_usuario.email} (#{@current_usuario.rol})"
      
    rescue JWT::InvalidIssuerError => e
      Rails.logger.error "    ❌ Issuer inválido: #{e.message}"
      render json: { error: 'Token no emitido por servicio autorizado' }, status: :unauthorized
      return
    rescue JWT::ExpiredSignature => e
      Rails.logger.error "    ❌ Token expirado: #{e.message}"
      render json: { error: 'Token expirado' }, status: :unauthorized
      return
    rescue JWT::DecodeError => e
      Rails.logger.error "    ❌ Error decodificando token: #{e.class} - #{e.message}"
      render json: { error: 'Token inválido' }, status: :unauthorized
      return
    end
  end

  def current_usuario
    @current_usuario
  end

  def current_arquitecto
    return @current_arquitecto if @current_arquitecto
    
    if current_usuario&.rol == 'arquitecto'
      @current_arquitecto = Arquitecto.find_by(usuario_id: current_usuario.id)
      Rails.logger.info "📋 [CURRENT_ARQUITECTO] Usuario ID: #{current_usuario.id}, Arquitecto encontrado: #{@current_arquitecto.present?}"
      Rails.logger.info "    Arquitecto ID: #{@current_arquitecto&.id}" if @current_arquitecto
    end
    
    @current_arquitecto
  end

  def current_cliente
    return @current_cliente if @current_cliente
    
    if current_usuario&.rol == 'cliente'
      @current_cliente = Cliente.find_by(usuario_id: current_usuario.id)
      Rails.logger.info "📋 [CURRENT_CLIENTE] Usuario ID: #{current_usuario.id}, Cliente encontrado: #{@current_cliente.present?}"
      Rails.logger.info "    Cliente ID: #{@current_cliente&.id}" if @current_cliente
    end
    
    @current_cliente
  end

  # Helpers de autorización por rol/propiedad
  def require_rol!(rol)
    unless current_usuario&.rol == rol
      render json: { error: "Rol no autorizado" }, status: :forbidden
      return
    end
  end

  # Helpers para cada rol específico
  def require_cliente!
    require_rol!("cliente")
  end

  def require_moderador!
    require_rol!("moderador")
  end

  def require_arquitecto!
    require_rol!("arquitecto")
    return if performed? # Detener si ya se hizo un render/redirect
    
    # Asegurar que el arquitecto existe
    unless current_arquitecto
      Rails.logger.error "    ❌ Usuario es arquitecto pero no tiene registro de Arquitecto"
      render json: { error: "Arquitecto no encontrado" }, status: :not_found
      return
    end
    
    Rails.logger.info "    ✅ Arquitecto ID: #{current_arquitecto.id}"
  end

  def require_ownership!(record)
    owner_id =
      if record.is_a?(Usuario)
        record.id
      elsif record.respond_to?(:usuario_id)
        record.usuario_id
      else
        nil
      end

    unless owner_id.present? && current_usuario&.id == owner_id
      render json: { error: "Prohibido" }, status: :forbidden
      return
    end
  end

  def not_found_response!(nombre)
    render json: { error: "#{nombre} no encontrado" }, status: :not_found
    return
  end
end

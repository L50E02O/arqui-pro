class Api::V1::SistemaLogsController < ApplicationController
  before_action :validate_api_key, only: [:create]

  # Endpoint para crear logs desde servicios externos (n8n)
  def create
    # Log para debugging - ver qué está recibiendo realmente
    Rails.logger.info "[DEBUG] Parámetros recibidos: #{params.inspect}"
    Rails.logger.info "[DEBUG] Content-Type: #{request.content_type}"
    
    # Leer el body raw y parsearlo manualmente si es necesario
    body_raw = request.body.read
    request.body.rewind # Resetear el body para que Rails pueda leerlo de nuevo
    Rails.logger.info "[DEBUG] Request body raw: #{body_raw.inspect}"
    Rails.logger.info "[DEBUG] Request body length: #{body_raw.length}"
    
    # Si el body tiene contenido JSON, parsearlo manualmente
    if body_raw.present? && request.content_type&.include?('application/json')
      begin
        parsed_json = JSON.parse(body_raw)
        Rails.logger.info "[DEBUG] JSON parseado: #{parsed_json.inspect}"
        # Mergear el JSON parseado en params
        parsed_json.each do |key, value|
          params[key] = value unless params.key?(key)
        end
      rescue JSON::ParserError => e
        Rails.logger.error "[ERROR] Error parseando JSON: #{e.message}"
        Rails.logger.error "[ERROR] Body que falló: #{body_raw.inspect}"
      end
    end
    
    Rails.logger.info "[DEBUG] params después de merge: #{params.inspect}"
    Rails.logger.info "[DEBUG] params[:log]: #{params[:log].inspect}"
    Rails.logger.info "[DEBUG] params[:sistema_log]: #{params[:sistema_log].inspect}"

    @log = SistemaLog.new(log_params)

    if @log.save
      render json: {
        success: true,
        message: 'Log guardado correctamente',
        id: @log.id
      }, status: :created
    else
      Rails.logger.error "[ERROR] Errores de validación: #{@log.errors.full_messages.inspect}"
      render json: {
        success: false,
        errors: @log.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # Endpoint para listar logs (requiere autenticación)
  def index
    authenticate_usuario!
    require_moderador!

    @logs = SistemaLog.recientes

    # Filtros opcionales
    @logs = @logs.por_tipo(params[:tipo]) if params[:tipo].present?
    @logs = @logs.por_estado(params[:estado]) if params[:estado].present?
    @logs = @logs.ultimos_dias(params[:dias].to_i) if params[:dias].present?

    # Paginación
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 20
    total = @logs.count
    @logs = @logs.offset((page - 1) * per_page).limit(per_page)

    render json: {
      logs: @logs.map do |log|
        {
          id: log.id,
          tipo: log.tipo,
          mensaje: log.mensaje,
          estado: log.estado,
          fecha_ejecucion: log.fecha_ejecucion,
          created_at: log.created_at,
          updated_at: log.updated_at
        }
      end,
      total: total,
      page: page,
      per_page: per_page
    }
  end

  # Endpoint para obtener un log específico (requiere autenticación)
  def show
    authenticate_usuario!
    require_moderador!

    @log = SistemaLog.find_by(id: params[:id])
    
    if @log
      render json: {
        id: @log.id,
        tipo: @log.tipo,
        mensaje: @log.mensaje,
        estado: @log.estado,
        fecha_ejecucion: @log.fecha_ejecucion,
        created_at: @log.created_at,
        updated_at: @log.updated_at
      }
    else
      render json: { error: 'Log no encontrado' }, status: :not_found
    end
  end

  private

  def log_params
    # Acepta parámetros envueltos en :log, :sistema_log o parámetros planos
    # También mapea campos de n8n (message -> mensaje, timestamp -> fecha_ejecucion, estado_general -> estado)
    unsafe_params = params.to_unsafe_h
    
    Rails.logger.info "[DEBUG] unsafe_params keys: #{unsafe_params.keys.inspect}"
    Rails.logger.info "[DEBUG] unsafe_params completo: #{unsafe_params.inspect}"
    
    # Intentar obtener parámetros desde diferentes formatos
    log_data = unsafe_params[:log] || unsafe_params['log'] || unsafe_params[:sistema_log] || unsafe_params['sistema_log'] || unsafe_params
    
    # Si log_data es un hash (wrapper), usarlo directamente, sino usar unsafe_params completo
    if log_data.is_a?(Hash) && (unsafe_params[:log].present? || unsafe_params['log'].present? || unsafe_params[:sistema_log].present? || unsafe_params['sistema_log'].present?)
      # Formato con wrapper
      tipo = log_data[:tipo] || log_data['tipo']
      mensaje = log_data[:mensaje] || log_data['mensaje'] || log_data[:message] || log_data['message']
      estado = log_data[:estado] || log_data['estado'] || log_data[:estado_general] || log_data['estado_general']
      fecha_ejecucion = log_data[:fecha_ejecucion] || log_data['fecha_ejecucion'] || log_data[:timestamp] || log_data['timestamp']
    else
      # Formato plano: mapear campos de n8n a campos de Rails
      tipo = unsafe_params[:tipo] || unsafe_params['tipo']
      mensaje = unsafe_params[:mensaje] || unsafe_params['mensaje'] || unsafe_params[:message] || unsafe_params['message']
      estado = unsafe_params[:estado] || unsafe_params['estado'] || unsafe_params[:estado_general] || unsafe_params['estado_general']
      fecha_ejecucion = unsafe_params[:fecha_ejecucion] || unsafe_params['fecha_ejecucion'] || unsafe_params[:timestamp] || unsafe_params['timestamp']
    end
    
    Rails.logger.info "[DEBUG] Campos extraídos - tipo: #{tipo.inspect}, mensaje: #{mensaje.inspect}, estado: #{estado.inspect}, fecha_ejecucion: #{fecha_ejecucion.inspect}"
    
    # Construir hash limpio con solo los campos permitidos
    # Usar .to_s para convertir a string y evitar problemas con nil
    clean_params = {}
    clean_params[:tipo] = tipo.to_s if tipo.present?
    clean_params[:mensaje] = mensaje.to_s if mensaje.present?
    clean_params[:estado] = estado.to_s if estado.present?
    clean_params[:fecha_ejecucion] = fecha_ejecucion.to_s if fecha_ejecucion.present?
    
    Rails.logger.info "[DEBUG] clean_params antes de permit: #{clean_params.inspect}"
    
    raw_params = ActionController::Parameters.new(clean_params).permit(:tipo, :mensaje, :estado, :fecha_ejecucion)
    
    # Normalizar el estado: mapear 'ok' -> 'exito' para cumplir con la validación del modelo
    if raw_params[:estado].present?
      raw_params[:estado] = 'exito' if raw_params[:estado].to_s.downcase == 'ok'
    end
    
    Rails.logger.info "[DEBUG] raw_params final: #{raw_params.inspect}"
    
    raw_params
  end


  def validate_api_key
    api_key = request.headers['X-API-Key']
    expected_key = ENV['N8N_API_KEY']

    unless expected_key.present?
      Rails.logger.error '[ERROR] N8N_API_KEY no configurada en variables de entorno'
      render json: { error: 'API Key no configurada en el servidor' }, status: :internal_server_error
      return
    end

    unless api_key.present? && api_key == expected_key
      Rails.logger.error "[ERROR] API Key inválida recibida: #{api_key.present? ? 'presente pero incorrecta' : 'no presente'}"
      render json: { error: 'API Key inválida' }, status: :unauthorized
      return
    end
  end
end
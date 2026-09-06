class Api::V1::ClientesController < ApplicationController
  before_action :set_cliente, only: %i[update show destroy]
  # Solo clientes autenticados pueden actualizar/eliminar
  before_action :authenticate_usuario!, only: %i[update destroy]
  before_action :require_cliente!, only: %i[update destroy]
  before_action :require_cliente_ownership!, only: %i[update destroy]

  def index
    @clientes = Cliente.all
    render json: @clientes
  end

  def create
    @cliente = Cliente.new(cliente_params)
    if @cliente.save
      render json: @cliente, status: :created
    else
      render json: @cliente.errors, status: :unprocessable_entity
    end
  end

  def show
    render json: @cliente
  end

  def update
    if @cliente.update(cliente_params)
      render json: @cliente
    else
      render json: @cliente.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @cliente
      @cliente.destroy
      head :no_content  # responde con 204 No Content si se eliminó correctamente
    else
      render json: { error: "cliente no encontrado" }, status: :not_found
    end
  end

  private

  def cliente_params
    params.require(:cliente).permit(:usuario_id, :cedula, usuario_attributes: [ :id, :nombre, :apellido, :email, :estado_cuenta, :password, :rol, :fecha_registro, :foto_perfil ])
  end

  def set_cliente
    @cliente = Cliente.find_by(id: params[:id])
  end

  def require_cliente_ownership!
    return not_found_response!("cliente") unless @cliente
    require_ownership!(@cliente)
  end
end

class Usuarios::RegistrationsController < Devise::RegistrationsController
    respond_to :json
  
  # POST /usuarios
    def create
        build_resource(sign_up_params)
        if resource.save
            render json: { status: 'success', data: resource }, status: :created
        else
            render json: { status: 'error', errors: resource.errors.full_messages }, status: :unprocessable_entity
        end
    end

  private
    def respond_with(resource, _opts = {})
        if resource.persisted?
            render json: {
            status: {code: 200, message: 'Usuario creado con éxito'},
            data: resource
            }, status: :ok
        else
            render json: {
            status: {message: "El usuario no pudo ser creado", errors: resource.errors.full_messages}
            }, status: :unprocessable_entity
        end
    end

    def sign_up_params
        params.require(:usuario).permit(
          :email, :password, :password_confirmation, :nombre, :apellido, 
          :rol, :estado_cuenta, :fecha_registro, :foto_perfil,
          cliente_attributes: [:cedula],
          arquitecto_attributes: [
            :cedula, :valoracion_prom_proyecto, :descripcion, 
            :especialidades, :ubicacion, :verificado, :vistas_perfil
          ],
          moderador_attributes: [:id] # Moderador solo necesita usuario_id (se asigna automáticamente)
        )
    end
end

module Api
    module V1
        class UsuariosController < ApplicationController
            # before_action :authenticate_usuario!, only: [:show, :update, :destroy]
            before_action :set_usuario, only: %i[update show destroy suspender activar]
            # Solo usuarios autenticados pueden actualizar/eliminar
            before_action :authenticate_usuario!, only: %i[update destroy suspender activar]
            before_action :require_moderador!, only: %i[suspender activar]

            def index
                @usuarios = Usuario.all
                render json: @usuarios
            end

            def create
                @usuario = Usuario.new(usuario_params)
                if @usuario.save
                    render json: @usuario, status: :created
                else
                    render json: @usuario.errors, status: :unprocessable_entity
                end
            end

            def show
                render json: @usuario
            end

            def update
                if @usuario.update(usuario_params)
                    render json: @usuario
                else
                    render json: @usuario.errors, status: :unprocessable_entity
                end
            end

            def destroy
                if @usuario
                    @usuario.destroy
                    head :no_content  # responde con 204 No Content si se eliminó correctamente
                else
                    render json: { error: "Usuario no encontrado" }, status: :not_found
                end
            end

            # Suspender un usuario (solo moderadores)
            def suspender
                unless @usuario
                    return render json: { error: "Usuario no encontrado" }, status: :not_found
                end

                if @usuario.update(estado_cuenta: 'suspendido')
                    render json: { 
                        status: 'success', 
                        message: 'Usuario suspendido exitosamente',
                        usuario: @usuario 
                    }, status: :ok
                else
                    render json: { 
                        status: 'error', 
                        errors: @usuario.errors.full_messages 
                    }, status: :unprocessable_entity
                end
            end

            # Activar un usuario suspendido (solo moderadores)
            def activar
                unless @usuario
                    return render json: { error: "Usuario no encontrado" }, status: :not_found
                end

                if @usuario.update(estado_cuenta: 'activo')
                    render json: { 
                        status: 'success', 
                        message: 'Usuario activado exitosamente',
                        usuario: @usuario 
                    }, status: :ok
                else
                    render json: { 
                        status: 'error', 
                        errors: @usuario.errors.full_messages 
                    }, status: :unprocessable_entity
                end
            end

            private

            def usuario_params
                params.require(:usuario).permit(:nombre, :apellido, :email, :estado_cuenta, :password, :rol, :fecha_registro, :foto_perfil,
                cliente_attributes: [:cedula],
                arquitecto_attributes: [:cedula, :valoracion_prom_proyecto, :descripcion, :especialidades, :ubicacion, :verificado, :vistas_perfil],
                moderador_attributes: [:num_incidencias_resultas, :num_arquitectos_verificados]
                )
            end

            def set_usuario
                @usuario = Usuario.find_by(id: params[:id])
            end

            def require_rol_if_usuario!
                return not_found_response!("usuario") unless @usuario
                require_rol!(@usuario.rol)
            end
        end
    end
end

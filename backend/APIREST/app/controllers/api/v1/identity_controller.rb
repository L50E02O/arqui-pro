module Api
  module V1
    class IdentityController < ApplicationController
      # Este endpoint es utilizado por el auth-microservicio para validar que la cédula
      # no exista antes de proceder con el registro del usuario.

      def validate_identity
        rol = params[:rol]
        cedula = params[:cedula]

        if rol == 'cliente'
          exists = Cliente.exists?(cedula: cedula)
        elsif rol == 'arquitecto'
          exists = Arquitecto.exists?(cedula: cedula)
        else
          # Si el rol es moderador u otro que no requiere cédula única por ahora
          render json: { valid: true }, status: :ok
          return
        end

        if exists
          render json: { 
            valid: false,
            error: "La cédula #{cedula} ya está registrada en el sistema para un #{rol}." 
          }, status: :conflict
        else
          render json: { valid: true }, status: :ok
        end
      end
    end
  end
end

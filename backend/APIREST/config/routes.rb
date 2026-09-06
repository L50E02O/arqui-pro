Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Ruta para validación síncrona de identidad desde auth-microservicio
  post "identity/validate", to: "api/v1/identity#validate_identity"

  # Defines the root path route ("/")
  # root "posts#index"
  namespace :api do
    namespace :v1 do
      devise_for :usuarios,
      controllers: {
        registrations: 'usuarios/registrations',
        sessions: 'usuarios/sessions'
      },
      defaults: { format: :json }
      resources :usuarios do
        member do
          post :suspender
          post :activar
        end
      end
      resources :clientes
      resources :arquitectos
      resources :moderadores
      resources :conversaciones do
        member do
          get :mensajes
          put :marcar_mensajes_leidos
        end
      end
      resources :notificaciones do
        collection do
          put :marcar_todas_leidas
        end
      end
      resources :verificaciones do
        member do
          post :aprobar
          post :rechazar
        end
      end
      resources :solicitudes_proyecto
      resources :proyectos do
        member do
          post :add_imagenes
        end
      end
      resources :avances
      resources :incidencias do
        member do
          post :resolver
          post :rechazar
          post :reabrir
        end
      end
      resources :valoraciones
      resources :mensajes
      resources :imagenes
      resources :imagen_asociaciones
      resources :sistema_logs, only: [:create, :index, :show]
    end
  end
end

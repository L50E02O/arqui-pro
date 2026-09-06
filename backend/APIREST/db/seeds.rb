# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Orden de carga respetando dependencias entre modelos

# 1. Usuarios (base para clientes, arquitectos y moderadores)
load Rails.root.join("db/seeds/usuarios_seed.rb")

# 2. Clientes, Arquitectos y Moderadores (dependen de usuarios)
load Rails.root.join("db/seeds/clientes_seed.rb")
load Rails.root.join("db/seeds/arquitectos_seed.rb")
load Rails.root.join("db/seeds/moderadores_seed.rb")

# 3. Conversaciones (dependen de clientes y arquitectos)
load Rails.root.join("db/seeds/conversaciones_seed.rb")

# 4. Notificaciones (dependen de usuarios)
load Rails.root.join("db/seeds/notificaciones_seed.rb")

# 5. Verificaciones (dependen de arquitectos y moderadores)
load Rails.root.join("db/seeds/verificaciones_seed.rb")

# 6. Solicitudes de Proyecto (dependen de arquitectos y clientes)
load Rails.root.join("db/seeds/solicitudes_proyecto_seed.rb")

# 7. Proyectos (dependen de arquitectos, clientes, conversaciones y solicitudes)
load Rails.root.join("db/seeds/proyectos_seed.rb")

# 8. Mensajes (dependen de conversaciones y usuarios)
load Rails.root.join("db/seeds/mensajes_seed.rb")

# 9. Avances (dependen de proyectos)
load Rails.root.join("db/seeds/avances_seed.rb")

# 10. Valoraciones (dependen de clientes y proyectos)
load Rails.root.join("db/seeds/valoraciones_seed.rb")

# 11. Incidencias (dependen de usuarios y moderadores)
load Rails.root.join("db/seeds/incidencias_seed.rb")

# 12. Imágenes (entidad independiente)
load Rails.root.join("db/seeds/imagenes_seed.rb")

# 13. Imagen Asociaciones (dependen de imágenes y entidades asociables)
load Rails.root.join("db/seeds/imagen_asociaciones_seed.rb")
# Be sure to restart your server when you modify this file.

# Add new inflection rules using the following format. Inflections
# are locale specific, and you may define rules for as many different
# locales as you wish. All of these examples are active by default:
# ActiveSupport::Inflector.inflections(:en) do |inflect|
#   inflect.plural /^(ox)$/i, "\\1en"
#   inflect.singular /^(ox)en/i, "\\1"
#   inflect.irregular "person", "people"
#   inflect.uncountable %w( fish sheep )
# end

# These inflection rules are supported but not enabled by default:
# ActiveSupport::Inflector.inflections(:en) do |inflect|
#   inflect.acronym "RESTful"
# end
ActiveSupport::Inflector.inflections(:en) do |inflect|
  inflect.irregular 'moderador', 'moderadores'
  inflect.irregular 'conversacion', 'conversaciones'
  inflect.irregular 'validacion', 'validaciones'
  inflect.irregular 'incidencia', 'incidencias'
  inflect.irregular 'verificacion', 'verificaciones'
  inflect.irregular 'valoracion', 'valoraciones'
  inflect.irregular 'proyecto', 'proyectos'
  inflect.irregular 'solicitud_proyecto', 'solicitudes_proyecto'
  inflect.irregular 'SolicitudProyecto', 'SolicitudesProyecto'
  inflect.irregular 'solicitudproyecto', 'solicitudesproyecto'
  inflect.irregular 'avance', 'avances'
  inflect.irregular 'imagen', 'imagenes'
  inflect.irregular 'notificacion', 'notificaciones'
  inflect.irregular 'mensaje', 'mensajes'
  inflect.irregular 'imagen_asociacion', 'imagen_asociaciones'
  inflect.irregular 'ImagenAsociacion', 'ImagenAsociaciones'
end

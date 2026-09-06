class UsuarioSerializer < ActiveModel::Serializer
  attributes :id, :nombre, :apellido, :email, :estado_cuenta,
  :rol, :fecha_registro, :foto_perfil
end

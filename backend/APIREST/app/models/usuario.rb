class Usuario < ApplicationRecord
  #include Devise::JWT::RevocationStrategies::JTIMatcher
  devise :database_authenticatable,
  :registerable #,
  # :jwt_authenticatable,
  # jwt_revocation_strategy: self # para revocar tokens, se usa la clase usuario para revocar tokens

  before_create :generate_jti

  # Solo tiene un cliente asociado
  # Cuando se elimina un usuario, se elimina también su cliente asociado
  has_one :cliente, dependent: :destroy
  accepts_nested_attributes_for :cliente

  # Solo tiene un arquitecto asociado
  # Cuando se elimina un usuario, se elimina también su arquitecto asociado
  has_one :arquitecto, dependent: :destroy
  accepts_nested_attributes_for :arquitecto

  # Solo tiene un moderador asociado
  # Cuando se elimina un usuario, se elimina también su moderador asociado
  has_one :moderador, dependent: :destroy
  accepts_nested_attributes_for :moderador

  # Un usuario puede tener muchas notificaciones
  # Cuando se elimina un usuario, se eliminan también sus notificaciones
  has_many :notificaciones, dependent: :destroy

  # Un usuario puede tener muchas Incidencias
  has_many :incidencias_emitidas, class_name: "Incidencia", foreign_key: "usuario_emisor_id"
  has_many :incidencias_recibidas, class_name: "Incidencia", foreign_key: "usuario_infractor_id"   

  # Un usuario puede tener muchos mensajes
  has_many :mensajes, class_name: "Mensaje", foreign_key: "remitente_id"

  # Validaciones
  validates :nombre, :apellido, :email, :rol, presence: true
  validates :estado_cuenta, inclusion: { in: ['suspendido', 'activo'] }
  validates :rol, inclusion: { in: ['cliente', 'arquitecto', 'moderador'] }
  # El email debe ser único
  validates :email, uniqueness: true
  # foto_perfil es opcional
  
  # Validar que solo se cree el registro asociado correcto según el rol
  validate :validar_registro_asociado_segun_rol

  def self.jwt_revoked?(payload, user)
      return true unless payload && payload['jti'] && user&.jti
      payload['jti'] != user.jti
  end
  
  def self.revoke_jwt(payload, user)
      return unless user
      user.update_column(:jti, SecureRandom.uuid)
  end
    
  private

  def generate_jti
    self.jti = SecureRandom.uuid
  end
  
  def validar_registro_asociado_segun_rol
    case rol
    when 'cliente'
      if arquitecto.present? || moderador.present?
        errors.add(:base, 'Un cliente no puede tener datos de arquitecto o moderador')
      end
    when 'arquitecto'
      if cliente.present? || moderador.present?
        errors.add(:base, 'Un arquitecto no puede tener datos de cliente o moderador')
      end
    when 'moderador'
      if cliente.present? || arquitecto.present?
        errors.add(:base, 'Un moderador no puede tener datos de cliente o arquitecto')
      end
    end
  end
end

class Conversacion < ApplicationRecord
  # Una conversacion le pertence a un cliente 
  belongs_to :cliente

  # Una converscion le pertenece a un arquitecto
  belongs_to :arquitecto

  # Una conversacion puede tener muchos mensajes
  # Si se elimina una conversacion, se eliminan tambien todos los mensajes
  has_many :mensajes, dependent: :destroy

  # Validaciones
  validates :cliente_id, presence: true
  validates :arquitecto_id, presence: true
  
  # Prevenir conversaciones duplicadas
  validates :cliente_id, uniqueness: { scope: :arquitecto_id, message: "ya tiene una conversación con este arquitecto" }
  
  # fecha tiene default (CURRENT_DATE), por lo que no es obligatoria en entrada
  
  # Método para obtener los IDs de usuario de los participantes
  def participante_ids
    [cliente.usuario_id, arquitecto.usuario_id].compact
  end
end

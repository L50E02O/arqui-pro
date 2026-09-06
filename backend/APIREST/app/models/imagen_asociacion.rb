class ImagenAsociacion < ApplicationRecord
  belongs_to :imagen
  belongs_to :asociable, polymorphic: true

  validates :asociable_id, :asociable_type, presence: true
  
end

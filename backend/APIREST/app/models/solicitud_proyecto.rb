class SolicitudProyecto < ApplicationRecord
  self.table_name = "solicitudes_proyecto"
  # Una solicitud de proyecto pertenece a un arquitecto y a un cliente
  belongs_to :arquitecto
  belongs_to :cliente

  # Validaciones
  validates :estado, inclusion: { in: ["pendiente", "aceptado", "rechazado"] }
end

class CreateSolicitudesProyecto < ActiveRecord::Migration[8.0]
  def change
    create_table :solicitudes_proyecto, id: :uuid do |t|
      t.string :estado, null: false, default: "pendiente"
      t.date :fecha, null: false
      t.references :arquitecto, null: false, foreign_key: true, type: :uuid
      t.references :cliente, null: false, foreign_key: true, type: :uuid
    end
    add_check_constraint :solicitudes_proyecto, "estado IN ('pendiente', 'aceptado', 'rechazado')", name: 'estado_solicitud_proyecto_check'    
  end
end

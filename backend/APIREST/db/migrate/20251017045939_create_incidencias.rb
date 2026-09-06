class CreateIncidencias < ActiveRecord::Migration[8.0]
  def change
    create_table :incidencias, id: :uuid do |t|
      t.text :descripcion, null: false
      t.string :estado, null: false
      t.date :fecha, null: false, default: -> { "CURRENT_TIMESTAMP" }
      t.references :usuario_emisor, null: false, foreign_key: { to_table: :usuarios }, type: :uuid
      t.references :usuario_infractor, null: false, foreign_key: { to_table: :usuarios }, type: :uuid
      t.references :moderador, null: false, foreign_key: true, type: :uuid
    end
    add_check_constraint :incidencias, "estado IN ('pendiente', 'resuelto', 'en revision')", name: "estado_incidencia_check"
  end
end

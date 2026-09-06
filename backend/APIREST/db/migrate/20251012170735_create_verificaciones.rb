class CreateVerificaciones < ActiveRecord::Migration[8.0]
  def change
    create_table :verificaciones, id: :uuid do |t|
      t.string :estado, null: false
      t.date :fecha_verificacion, null: false
      t.references :arquitecto, null: false, foreign_key: true, type: :uuid
      t.references :moderador, null: false, foreign_key: true, type: :uuid
    end
    add_check_constraint :verificaciones, "estado IN ('pendiente', 'verificado', 'rechazado')", name: 'estado_check'
    add_index :verificaciones, :arquitecto_id, unique: true
  end
end

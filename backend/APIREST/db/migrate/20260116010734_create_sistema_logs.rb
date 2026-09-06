class CreateSistemaLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :sistema_logs, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :tipo, null: false
      t.text :mensaje, null: false
      t.jsonb :datos
      t.string :estado, null: false
      t.timestamp :fecha_ejecucion, null: false
      t.timestamps
    end

    add_index :sistema_logs, :tipo
    add_index :sistema_logs, :estado
    add_index :sistema_logs, :fecha_ejecucion
    add_check_constraint :sistema_logs, "estado IN ('exito', 'error')", name: "estado_log_check"
  end
end

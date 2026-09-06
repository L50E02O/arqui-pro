class CreateImagenAsociaciones < ActiveRecord::Migration[8.0]
  def change
    create_table :imagen_asociaciones, id: :uuid do |t|
      t.string :asociable_type, null: false
      t.string :asociable_id, null: false
      t.references :imagen, null: false, foreign_key: true, type: :uuid
    end
    add_index :imagen_asociaciones, [:asociable_type, :asociable_id]
    add_check_constraint :imagen_asociaciones, "asociable_type IN ('Proyecto', 'Mensaje', 'Incidencia', 'Avance')", name: "asociable_type_imagen_asociacion_check"
  end
end

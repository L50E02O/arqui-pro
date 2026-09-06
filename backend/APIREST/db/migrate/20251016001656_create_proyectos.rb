class CreateProyectos < ActiveRecord::Migration[8.0]
  def change
    create_table :proyectos, id: :uuid do |t|
      t.text :titulo_proyecto, null: false
      t.float :valoracion_promedio, null: false, default: 0.0
      t.text :descripcion, null: false
      t.string :tipo_proyecto, null: false
      t.date :fecha_publicacion, null: false
      t.references :arquitecto, null: false, foreign_key: true, type: :uuid
      t.references :conversacion, null: true, foreign_key: true, type: :uuid
      t.references :cliente, null: true, foreign_key: true, type: :uuid
      t.references :solicitud_proyecto, null: true, foreign_key: true, type: :uuid
    end
    add_check_constraint :proyectos, "tipo_proyecto IN ('portafolio', 'contratado')", name: "tipo_proyecto_check"
  end
end

class CreateArquitectos < ActiveRecord::Migration[8.0]
  def change
    create_table :arquitectos, id: :uuid do |t|
      t.string :cedula, null: false
      t.float :valoracion_prom_proyecto, null:false, default: 0.0
      t.text :descripcion, null: false
      t.string :especialidades, null: false
      t.string :ubicacion, null: false
      t.boolean :verificado, null: false, default: false
      t.integer :vistas_perfil, null: false, default: 0
      t.references :usuario, null: false, foreign_key: true, type: :uuid
    end
      add_index :arquitectos, :cedula, unique: true
  end
end

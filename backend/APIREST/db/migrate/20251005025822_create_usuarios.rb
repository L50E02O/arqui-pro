class CreateUsuarios < ActiveRecord::Migration[8.0]
  def change
    create_table :usuarios, id: :uuid do |t|
      t.string :nombre, null: false
      t.string :apellido, null: false
      t.string :email, null: false
      t.string :estado_cuenta, null: false
      t.string :password, null: false
      t.string :rol, null: false
      t.date :fecha_registro, null: false
      t.string :foto_perfil, null: true
    end
      add_index :usuarios, :email, unique: true
      add_check_constraint :usuarios, "estado_cuenta IN ('suspendido', 'activo')", name: 'estado_check'
      add_check_constraint :usuarios, "rol IN ('cliente', 'arquitecto', 'moderador')", name: 'rol_check'
  end
end

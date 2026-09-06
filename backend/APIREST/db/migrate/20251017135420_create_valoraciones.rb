class CreateValoraciones < ActiveRecord::Migration[8.0]
  def change
    create_table :valoraciones, id: :uuid do |t|
      t.float :calificacion, null: false
      t.text :comentario, null: false
      t.date :fecha, null: false, default: -> { "CURRENT_TIMESTAMP" }
      t.references :cliente, null: false, foreign_key: true, type: :uuid
      t.references :proyecto, null: false, foreign_key: true, type: :uuid
    end
  end
end

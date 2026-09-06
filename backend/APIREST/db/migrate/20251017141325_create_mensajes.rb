class CreateMensajes < ActiveRecord::Migration[8.0]
  def change
    create_table :mensajes, id: :uuid do |t|
      t.text :contenido, null: false
      t.date :fecha_envio, null: false, default: -> { "CURRENT_TIMESTAMP" }
      t.boolean :leido, null: false, default: false
      t.references :conversacion, null: false, foreign_key: true, type: :uuid
      t.references :remitente, null: false, foreign_key: { to_table: :usuarios }, type: :uuid
    end
  end
end

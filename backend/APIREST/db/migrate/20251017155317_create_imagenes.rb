class CreateImagenes < ActiveRecord::Migration[8.0]
  def change
    create_table :imagenes, id: :uuid do |t|
      t.text :imagen_url, null: false
      t.date :fecha, null: false, default: -> { "CURRENT_TIMESTAMP" }
    end
  end
end

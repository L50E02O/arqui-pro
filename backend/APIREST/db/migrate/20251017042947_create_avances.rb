class CreateAvances < ActiveRecord::Migration[8.0]
  def change
    create_table :avances, id: :uuid do |t|
      t.text :descripcion, null: false
      t.date :fecha, null: false, default: -> { "CURRENT_TIMESTAMP" }
      t.references :proyecto, null: false, foreign_key: true, type: :uuid
    end
  end
end

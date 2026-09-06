class CreateConversaciones < ActiveRecord::Migration[8.0]
  def change
    create_table :conversaciones, id: :uuid do |t|
      t.date :fecha, null: false
      t.references :cliente, null: false, foreign_key: true, type: :uuid
      t.references :arquitecto, null: false, foreign_key: true, type: :uuid
    end
  end
end

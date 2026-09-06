class CreateNotificaciones < ActiveRecord::Migration[8.0]
  def change
    create_table :notificaciones, id: :uuid do |t|
      t.text :mensaje, null: false
      t.date :fecha, null: false
      t.boolean :leido, null: false, default: false
      t.references :usuario, null: false, foreign_key: true, type: :uuid
    end
  end
end

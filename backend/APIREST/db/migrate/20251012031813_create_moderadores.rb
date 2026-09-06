class CreateModeradores < ActiveRecord::Migration[8.0]
  def change
    create_table :moderadores, id: :uuid do |t|
      t.references :usuario, null: false, foreign_key: true, type: :uuid
    end
  end
end

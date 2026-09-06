class RemoveFkFromProfiles < ActiveRecord::Migration[8.0]
  def change
    remove_foreign_key :clientes, :usuarios
    remove_foreign_key :arquitectos, :usuarios
    remove_foreign_key :moderadores, :usuarios
  end
end

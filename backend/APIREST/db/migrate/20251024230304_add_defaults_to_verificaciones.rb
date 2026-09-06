class AddDefaultsToVerificaciones < ActiveRecord::Migration[8.0]
  def change
    change_column_default :verificaciones, :estado, "pendiente"
    change_column_default :verificaciones, :fecha_verificacion, -> { "CURRENT_DATE" }
  end
end

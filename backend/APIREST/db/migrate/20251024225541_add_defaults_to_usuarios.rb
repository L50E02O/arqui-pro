class AddDefaultsToUsuarios < ActiveRecord::Migration[8.0]
  def change
    change_column_default :usuarios, :fecha_registro, -> { "CURRENT_DATE" }
    change_column_default :usuarios, :estado_cuenta, "activo"    
  end
end

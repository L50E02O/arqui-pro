class AddDefaultsToProyectos < ActiveRecord::Migration[8.0]
  def change
    change_column_default :proyectos, :fecha_publicacion, -> { "CURRENT_DATE" }
  end
end

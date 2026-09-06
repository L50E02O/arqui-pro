class AddDefaultsToSolicitudesProyecto < ActiveRecord::Migration[8.0]
  def change
    change_column_default :solicitudes_proyecto, :fecha, -> { "CURRENT_DATE" }
  end
end

class AddDefaultsToNotificaciones < ActiveRecord::Migration[8.0]
  def change
    change_column_default :notificaciones, :fecha, -> { "CURRENT_DATE" }
  end
end

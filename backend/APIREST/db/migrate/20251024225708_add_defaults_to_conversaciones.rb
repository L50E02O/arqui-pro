class AddDefaultsToConversaciones < ActiveRecord::Migration[8.0]
  def change
    change_column_default :conversaciones, :fecha, -> { "CURRENT_DATE" }
  end
end

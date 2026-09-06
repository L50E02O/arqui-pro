class AddNumIncidenciaResueltasAndNumArquitectosVerificadosToModeradores < ActiveRecord::Migration[8.0]
  def change
    add_column :moderadores, :num_incidencias_resueltas, :integer, null: false, default: 0
    add_column :moderadores, :num_arquitectos_verificados, :integer, null: false, default: 0
  end
end

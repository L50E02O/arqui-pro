puts "Creando Moderadores..."

Moderador.create!([
  {
    id: "0f3f4cdc-ef7f-45d7-ae82-1900ecf227c7",
    usuario_id: "8188c049-b43b-43a5-b048-4efedfe2536f",
  },
  {
    id: "d1c4e8b2-3f4a-4e2b-9f7e-5c6d7e8f9a0b",
    usuario_id: "464e2a37-2df2-40b3-b213-f4f976e972b8"
  },
  # Nuevo Moderador
  {
    id: "9c0d1e2f-3a4b-4c5d-6e7f-8a9b0c1d2e3f",
    usuario_id: "c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f"
  }
])

puts "Moderadores creados."
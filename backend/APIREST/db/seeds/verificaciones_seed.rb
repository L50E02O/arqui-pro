puts "Creando verificaciones..."

Verificacion.create!([
  {
    id: "6a1d0da6-a014-4976-87c5-ca5cb82fcd06",
    estado: "verificado",
    fecha_verificacion: "2025-10-12",
    arquitecto_id: "2f2a0e35-7d47-4bc8-b1fb-5a31b1de64a1",
    moderador_id: "0f3f4cdc-ef7f-45d7-ae82-1900ecf227c7"
  },
  {
    id: "9951196c-497f-49b6-b96f-f1944986e45c",
    estado: "pendiente",
    fecha_verificacion: "2025-10-12",
    arquitecto_id: "b78ade33-f566-47e8-9266-85b1f97c72ea",
    moderador_id: "0f3f4cdc-ef7f-45d7-ae82-1900ecf227c7"
  },
  # Nuevas Verificaciones para nuevos arquitectos
  {
    id: "7e8f9a0b-1c2d-4e3f-4a5b-6c7d8e9f0a1c",
    estado: "verificado",
    fecha_verificacion: "2025-10-22",
    arquitecto_id: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b", # Carlos Rodriguez
    moderador_id: "9c0d1e2f-3a4b-4c5d-6e7f-8a9b0c1d2e3f" # Ricardo Morales
  },
  {
    id: "8f9a0b1c-2d3e-4f4a-5b6c-7d8e9f0a1b2d",
    estado: "verificado",
    fecha_verificacion: "2025-10-23",
    arquitecto_id: "6f7a8b9c-0d1e-4f2a-3b4c-5d6e7f8a9b0c", # Ana Martinez
    moderador_id: "0f3f4cdc-ef7f-45d7-ae82-1900ecf227c7" # Pepe Velez
  },
  {
    id: "9a0b1c2d-3e4f-4a5b-6c7d-8e9f0a1b2c3e",
    estado: "pendiente",
    fecha_verificacion: "2025-10-24",
    arquitecto_id: "7a8b9c0d-1e2f-4a3b-4c5d-6e7f8a9b0c1d", # Luis Fernandez
    moderador_id: "d1c4e8b2-3f4a-4e2b-9f7e-5c6d7e8f9a0b" # Mateo Velez
  },
  {
    id: "0b1c2d3e-4f5a-4b6c-7d8e-9f0a1b2c3d4f",
    estado: "verificado",
    fecha_verificacion: "2025-10-25",
    arquitecto_id: "8b9c0d1e-2f3a-4b4c-5d6e-7f8a9b0c1d2e", # Sofia Lopez
    moderador_id: "9c0d1e2f-3a4b-4c5d-6e7f-8a9b0c1d2e3f" # Ricardo Morales
  }
])

puts "Verificaciones creadas."
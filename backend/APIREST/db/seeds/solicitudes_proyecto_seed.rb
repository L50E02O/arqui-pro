puts "Creando solicitudes de proyecto..."

SolicitudProyecto.create!([
  {
    id: "e8a3b5c1-4d7f-4e9a-b2c8-1a5f6d8e9c2b",
    estado: "aceptado",
    fecha: "2025-10-15",
    arquitecto_id: "b78ade33-f566-47e8-9266-85b1f97c72ea", # Maria Garcia (arquitecto)
    cliente_id: "4d65811a-774c-4143-9852-a30ef0d555a4" # Marcos Garcia (cliente)
  },
  {
    id: "f9b4c6d2-5e8a-5f0b-c3d9-2b6a7e9f0d3c",
    estado: "pendiente",
    fecha: "2025-10-20",
    arquitecto_id: "2f2a0e35-7d47-4bc8-b1fb-5a31b1de64a1", # Joaquin Palacios (arquitecto)
    cliente_id: "b1e8f3e2-2f4c-4d6a-9f7e-3c9e8f0b6a2c" # Juan Macias (cliente)
  },
  {
    id: "a0c5d7e3-6f9a-6a1c-d4e0-3c7a8f0a1e4d",
    estado: "rechazado",
    fecha: "2025-10-18",
    arquitecto_id: "b78ade33-f566-47e8-9266-85b1f97c72ea", # Maria Garcia (arquitecto)
    cliente_id: "b1e8f3e2-2f4c-4d6a-9f7e-3c9e8f0b6a2c" # Juan Macias (cliente)
  },
  {
    id: "b1d6e8f4-7a0a-7a2d-e5f1-4d8a9a1a2f5e",
    estado: "aceptado",
    fecha: "2025-10-17",
    arquitecto_id: "2f2a0e35-7d47-4bc8-b1fb-5a31b1de64a1", # Joaquin Palacios (arquitecto)
    cliente_id: "4d65811a-774c-4143-9852-a30ef0d555a4" # Marcos Garcia (cliente)
  },
  # Nuevas Solicitudes con nuevos usuarios
  {
    id: "4b5c6d7e-8f9a-4b0c-1d2e-3f4a5b6c7d8e",
    estado: "aceptado",
    fecha: "2025-10-21",
    arquitecto_id: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b", # Carlos Rodriguez (nuevo arquitecto)
    cliente_id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d" # Pedro Sanchez (nuevo cliente)
  },
  {
    id: "5c6d7e8f-9a0b-4c1d-2e3f-4a5b6c7d8e9f",
    estado: "pendiente",
    fecha: "2025-10-22",
    arquitecto_id: "6f7a8b9c-0d1e-4f2a-3b4c-5d6e7f8a9b0c", # Ana Martinez (nueva arquitecta)
    cliente_id: "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e" # Laura Gomez (nueva cliente)
  },
  {
    id: "6d7e8f9a-0b1c-4d2e-3f4a-5b6c7d8e9f0a",
    estado: "aceptado",
    fecha: "2025-10-23",
    arquitecto_id: "7a8b9c0d-1e2f-4a3b-4c5d-6e7f8a9b0c1d", # Luis Fernandez (nuevo arquitecto)
    cliente_id: "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f" # Miguel Torres (nuevo cliente)
  },
  {
    id: "7e8f9a0b-1c2d-4e3f-4a5b-6c7d8e9f0a1b",
    estado: "aceptado",
    fecha: "2025-10-24",
    arquitecto_id: "8b9c0d1e-2f3a-4b4c-5d6e-7f8a9b0c1d2e", # Sofia Lopez (nueva arquitecta)
    cliente_id: "4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a" # Carmen Ruiz (nueva cliente)
  }
])

puts "Solicitudes de proyecto creadas."


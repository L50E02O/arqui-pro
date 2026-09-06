puts "Creando Conversaciones..."

Conversacion.create!([
  {
    id: "79f484bb-ea90-464e-8666-4cc69c3fe3b4",
    fecha: "2025-10-12",
    cliente_id: "4d65811a-774c-4143-9852-a30ef0d555a4",
    arquitecto_id: "b78ade33-f566-47e8-9266-85b1f97c72ea"
  },
  {
    id: "a1c5f8e2-3b6e-4f9d-9c3e-2f4b5d6e7f8a",
    fecha: "2025-10-12",
    cliente_id: "b1e8f3e2-2f4c-4d6a-9f7e-3c9e8f0b6a2c",
    arquitecto_id: "2f2a0e35-7d47-4bc8-b1fb-5a31b1de64a1"
  },
  # Nuevas Conversaciones con nuevos usuarios
  {
    id: "0d1e2f3a-4b5c-4d6e-7f8a-9b0c1d2e3f4a",
    fecha: "2025-10-20",
    cliente_id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
    arquitecto_id: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b"
  },
  {
    id: "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b",
    fecha: "2025-10-21",
    cliente_id: "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
    arquitecto_id: "6f7a8b9c-0d1e-4f2a-3b4c-5d6e7f8a9b0c"
  },
  {
    id: "2f3a4b5c-6d7e-4f8a-9b0c-1d2e3f4a5b6c",
    fecha: "2025-10-22",
    cliente_id: "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f",
    arquitecto_id: "7a8b9c0d-1e2f-4a3b-4c5d-6e7f8a9b0c1d"
  },
  {
    id: "3a4b5c6d-7e8f-4a9b-0c1d-2e3f4a5b6c7d",
    fecha: "2025-10-23",
    cliente_id: "4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a",
    arquitecto_id: "8b9c0d1e-2f3a-4b4c-5d6e-7f8a9b0c1d2e"
  }
])

puts "Conversaciones creadas."
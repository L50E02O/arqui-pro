puts "Creando clientes..."

Cliente.create!([
  {
    id: "4d65811a-774c-4143-9852-a30ef0d555a4",
    cedula: "1300987654",
    usuario_id: "5af9923c-27c9-4fdc-9221-d7b8e416e487"
  },
  {
    id: "b1e8f3e2-2f4c-4d6a-9f7e-3c9e8f0b6a2c",
    cedula: "1101234567",
    usuario_id: "384fe367-90c2-4a70-b63f-8e64e9bb1d80"
  },
  # Nuevos Clientes
  {
    id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
    cedula: "1310246789",
    usuario_id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b"
  },
  {
    id: "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
    cedula: "1310247890",
    usuario_id: "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c"
  },
  {
    id: "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f",
    cedula: "1310248901",
    usuario_id: "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d"
  },
  {
    id: "4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a",
    cedula: "1310249012",
    usuario_id: "b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e"
  }
])

puts "Clientes creados."
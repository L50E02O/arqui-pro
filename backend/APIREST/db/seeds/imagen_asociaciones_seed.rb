puts "Creando asociaciones de imágenes..."

ImagenAsociacion.create!([
  # Imágenes para el proyecto "Casa Moderna"
  {
    id: "e6a1b3c9-2d5e-2e7a-b0c6-9a3e4d6e7c0b",
    asociable_type: "Proyecto",
    asociable_id: "c2e7f9a5-8a1a-8a3e-f6a2-5e9a0a2a3a6f",
    imagen_id: "a6c1d3e9-2f5a-2a7c-d0e6-9c3a4f6a7e0d"
  },
  {
    id: "f7b2c4d0-3e6f-3f8b-c1d7-0b4f5e7f8d1c",
    asociable_type: "Proyecto",
    asociable_id: "c2e7f9a5-8a1a-8a3e-f6a2-5e9a0a2a3a6f",
    imagen_id: "b7d2e4f0-3a6b-3b8d-e1f7-0d4b5a7b8f1e"
  },
  # Imágenes para el proyecto "Remodelación de Apartamento"
  {
    id: "a8c3d5e1-4f7a-4a9c-d2e8-1c5a6f8a9e2d",
    asociable_type: "Proyecto",
    asociable_id: "e4a9a1a7-0a3a-0a5a-a8a4-7a1a2a4a5a8a",
    imagen_id: "e0a5b7c3-6d9e-6e1a-b4c0-3a7e8d0a1c4b"
  },
  {
    id: "b9d4e6f2-5a8b-5b0d-e3f9-2d6b7a9b0f3e",
    asociable_type: "Proyecto",
    asociable_id: "e4a9a1a7-0a3a-0a5a-a8a4-7a1a2a4a5a8a",
    imagen_id: "f1b6c8d4-7e0f-7f2b-c5d1-4b8f9e1f2d5c"
  },
  # Imágenes para avance de "Casa Moderna"
  {
    id: "c0e5f7a3-6b9c-6c1e-f4a0-3e7c8b0c1a4f",
    asociable_type: "Avance",
    asociable_id: "04a9b1c7-0d3e-0e5a-b8c4-7a1e2d4e5c8b",
    imagen_id: "c8e3f5a1-4b7c-4c9e-f2a8-1e5c6b8c9a2f"
  },
  {
    id: "d1f6a8b4-7c0d-7d2f-a5b1-4f8d9c1d2b5a",
    asociable_type: "Avance",
    asociable_id: "15b0c2d8-1e4f-1f6b-c9d5-8b2f3e5f6d9c",
    imagen_id: "d9f4a6b2-5c8d-5d0f-a3b9-2f6d7c9d0b3a"
  },
  # Imágenes para avance de "Remodelación Apartamento"
  {
    id: "e2a7b9c5-8d1e-8e3a-b6c2-5a9e0d2e3c6b",
    asociable_type: "Avance",
    asociable_id: "48e3f5a1-4b7c-4c9e-f2a8-1e5c6b8c9a2f",
    imagen_id: "a2c7d9e5-8f1a-8a3c-d6e2-5c9a0f2c3e6d"
  },
  {
    id: "f3b8c0d6-9e2f-9f4b-c7d3-6b0f1e3f4d7c",
    asociable_type: "Avance",
    asociable_id: "59f4a6b2-5c8d-5d0f-a3b9-2f6d7c9d0b3a",
    imagen_id: "b3d8e0f6-9a2b-9b4d-e7f3-6d0b1a3b4f7e"
  },
  # Imagen para mensaje
  {
    id: "a4c9d1e7-0f3a-0a5c-d8e4-7c1a2f4a5e8d",
    asociable_type: "Mensaje",
    asociable_id: "d9e4f6a2-5b8d-5d0e-f3a9-2e6d7b9d0a3f",
    imagen_id: "c4e9f1a7-0b3c-0c5e-f8a4-7e1c2b4c5a8f"
  },
  # Imagen para incidencia
  {
    id: "b5d0e2f8-1a4b-1b6d-e9f5-8d2b3a5b6f9e",
    asociable_type: "Incidencia",
    asociable_id: "e5b0c2d8-1e4a-1f6b-c9d5-8b2a3e5f6d9c",
    imagen_id: "d5f0a2b8-1c4d-1d6f-a9b5-8f2d3c5d6b9a"
  },
  # Nuevas Asociaciones para nuevos proyectos
  {
    id: "9e0f1a2b-3c4d-4e5f-6a7b-8c9d0e1f2a3c",
    asociable_type: "Proyecto",
    asociable_id: "8f9a0b1c-2d3e-4f4a-5b6c-7d8e9f0a1b2c", # Centro Comercial Moderno
    imagen_id: "1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5a"
  },
  {
    id: "0f1a2b3c-4d5e-4f6a-7b8c-9d0e1f2a3b4d",
    asociable_type: "Proyecto",
    asociable_id: "8f9a0b1c-2d3e-4f4a-5b6c-7d8e9f0a1b2c", # Centro Comercial Moderno
    imagen_id: "2d3e4f5a-6b7c-4d8e-9f0a-1b2c3d4e5f6b"
  },
  {
    id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5b",
    asociable_type: "Proyecto",
    asociable_id: "9a0b1c2d-3e4f-4a5b-6c7d-8e9f0a1b2c3d", # Parque Urbano Sustentable
    imagen_id: "3e4f5a6b-7c8d-4e9f-0a1b-2c3d4e5f6a7c"
  },
  {
    id: "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6a",
    asociable_type: "Proyecto",
    asociable_id: "0b1c2d3e-4f5a-4b6c-7d8e-9f0a1b2c3d4e", # Restauración Casa Colonial
    imagen_id: "4f5a6b7c-8d9e-4f0a-1b2c-3d4e5f6a7b8d"
  },
  {
    id: "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7b",
    asociable_type: "Proyecto",
    asociable_id: "1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f", # Complejo Residencial Ecológico
    imagen_id: "5a6b7c8d-9e0f-4a1b-2c3d-4e5f6a7b8c9e"
  },
  # Imágenes para avances de nuevos proyectos
  {
    id: "4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8c",
    asociable_type: "Avance",
    asociable_id: "2d3e4f5a-6b7c-4d8e-9f0a-1b2c3d4e5f6a", # Avance Centro Comercial
    imagen_id: "6b7c8d9e-0f1a-4b2c-3d4e-5f6a7b8c9d0f"
  },
  {
    id: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9d",
    asociable_type: "Avance",
    asociable_id: "4f5a6b7c-8d9e-4f0a-1b2c-3d4e5f6a7b8c", # Avance Casa Colonial
    imagen_id: "7c8d9e0f-1a2b-4c3d-4e5f-6a7b8c9d0e1a"
  },
  {
    id: "6f7a8b9c-0d1e-4f2a-3b4c-5d6e7f8a9b0e",
    asociable_type: "Avance",
    asociable_id: "7c8d9e0f-1a2b-4c3d-4e5f-6a7b8c9d0e1f", # Avance Complejo Ecológico
    imagen_id: "8d9e0f1a-2b3c-4d4e-5f6a-7b8c9d0e1f2b"
  },
  # Imágenes para mensajes de nuevas conversaciones
  {
    id: "7a8b9c0d-1e2f-4a3b-4c5d-6e7f8a9b0c1f",
    asociable_type: "Mensaje",
    asociable_id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5e",
    imagen_id: "1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5a"
  },
  # Imagen para nueva incidencia
  {
    id: "8b9c0d1e-2f3a-4b4c-5d6e-7f8a9b0c1d2a",
    asociable_type: "Incidencia",
    asociable_id: "0d1e2f3a-4b5c-4d6e-7f8a-9b0c1d2e3f4b",
    imagen_id: "2d3e4f5a-6b7c-4d8e-9f0a-1b2c3d4e5f6b"
  }
])

puts "Asociaciones de imágenes creadas."


puts "Creando valoraciones..."

Valoracion.create!([
  {
    id: "e0a5b7c3-6d9e-6a1a-b4c0-3a7e8d0a1c4b",
    calificacion: 4.8,
    comentario: "Excelente trabajo. Maria fue muy profesional y atenta a todos los detalles. El diseño superó mis expectativas.",
    fecha: "2025-10-22",
    cliente_id: "4d65811a-774c-4143-9852-a30ef0d555a4", # Marcos Garcia (cliente)
    proyecto_id: "c2e7f9a5-8a1a-8a3e-f6a2-5e9a0a2a3a6f" # Casa Moderna
  },
  {
    id: "f1b6c8d4-7e0f-7b2b-c5d1-4b8f9e1b2d5c",
    calificacion: 4.9,
    comentario: "La remodelación quedó perfecta. Joaquin es un arquitecto muy talentoso y cumplió con todos los plazos acordados.",
    fecha: "2025-10-24",
    cliente_id: "4d65811a-774c-4143-9852-a30ef0d555a4", # Marcos Garcia (cliente)
    proyecto_id: "e4a9a1a7-0a3a-0a5a-a8a4-7a1a2a4a5a8a" # Remodelación Apartamento
  },
  {
    id: "a2c7d9e5-8f1a-8c3c-d6e2-5c9a0f2c3e6d",
    calificacion: 5.0,
    comentario: "Impresionante diseño de villa. Maria tiene un ojo excepcional para los detalles y el espacio. Totalmente recomendada.",
    fecha: "2025-10-13",
    cliente_id: "b1e8f3e2-2f4c-4d6a-9f7e-3c9e8f0b6a2c", # Juan Macias (cliente)
    proyecto_id: "f5a0a2a8-1a4a-1a6a-a9a5-8a2a3a5a6a9a" # Villa Campestre
  },
  # Nuevas Valoraciones con nuevos usuarios
  {
    id: "8d9e0f1a-2b3c-4d4e-5f6a-7b8c9d0e1f2a",
    calificacion: 4.6,
    comentario: "Carlos hizo un trabajo fantástico con el centro comercial. Muy creativo y funcional.",
    fecha: "2025-10-27",
    cliente_id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", # Pedro Sanchez (nuevo cliente)
    proyecto_id: "8f9a0b1c-2d3e-4f4a-5b6c-7d8e9f0a1b2c" # Centro Comercial Moderno
  },
  {
    id: "9e0f1a2b-3c4d-4e5f-6a7b-8c9d0e1f2a3b",
    calificacion: 4.8,
    comentario: "Luis es un experto en restauración. Respetó la arquitectura original y la casa quedó preciosa.",
    fecha: "2025-10-30",
    cliente_id: "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f", # Miguel Torres (nuevo cliente)
    proyecto_id: "0b1c2d3e-4f5a-4b6c-7d8e-9f0a1b2c3d4e" # Restauración Casa Colonial
  },
  {
    id: "0f1a2b3c-4d5e-4f6a-7b8c-9d0e1f2a3b4c",
    calificacion: 4.9,
    comentario: "Sofia diseñó un complejo ecológico increíble. Muy comprometida con la sostenibilidad.",
    fecha: "2025-11-01",
    cliente_id: "4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a", # Carmen Ruiz (nueva cliente)
    proyecto_id: "1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f" # Complejo Residencial Ecológico
  }
])

puts "Valoraciones creadas."


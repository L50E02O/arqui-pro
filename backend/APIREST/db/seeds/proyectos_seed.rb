puts "Creando proyectos..."

Proyecto.create!([
  {
    id: "c2e7f9a5-8a1a-8a3e-f6a2-5e9a0a2a3a6f",
    titulo_proyecto: "Casa Moderna en Zona Residencial",
    valoracion_promedio: 4.8,
    descripcion: "Diseño arquitectónico moderno para residencia familiar de 250m2 con 3 habitaciones, amplios ventanales y espacios abiertos. Incluye jardín frontal y área de BBQ.",
    tipo_proyecto: "contratado",
    fecha_publicacion: "2025-10-16",
    arquitecto_id: "b78ade33-f566-47e8-9266-85b1f97c72ea", # Maria Garcia (arquitecto)
    conversacion_id: "79f484bb-ea90-464e-8666-4cc69c3fe3b4", # Conversacion existente
    cliente_id: "4d65811a-774c-4143-9852-a30ef0d555a4", # Marcos Garcia (cliente)
    solicitud_proyecto_id: "e8a3b5c1-4d7f-4e9a-b2c8-1a5f6d8e9c2b"
  },
  {
    id: "d3f8a0a6-9a2a-9a4f-a7a3-6f0a1a3a4a7a",
    titulo_proyecto: "Edificio de Oficinas Corporativo",
    valoracion_promedio: 4.5,
    descripcion: "Proyecto de edificio corporativo de 5 pisos con diseño sostenible, fachada de vidrio, estacionamiento subterráneo y áreas verdes.",
    tipo_proyecto: "portafolio",
    fecha_publicacion: "2025-10-12",
    arquitecto_id: "2f2a0e35-7d47-4bc8-b1fb-5a31b1de64a1", # Joaquin Palacios (arquitecto)
    conversacion_id: nil,
    cliente_id: nil,
    solicitud_proyecto_id: nil
  },
  {
    id: "e4a9a1a7-0a3a-0a5a-a8a4-7a1a2a4a5a8a",
    titulo_proyecto: "Remodelación de Apartamento",
    valoracion_promedio: 4.9,
    descripcion: "Renovación completa de apartamento de 120m2 incluyendo cocina, baños, pisos y pintura. Estilo minimalista contemporáneo.",
    tipo_proyecto: "contratado",
    fecha_publicacion: "2025-10-18",
    arquitecto_id: "2f2a0e35-7d47-4bc8-b1fb-5a31b1de64a1", # Joaquin Palacios (arquitecto)
    conversacion_id: "a1c5f8e2-3b6e-4f9d-9c3e-2f4b5d6e7f8a", # Segunda conversacion
    cliente_id: "4d65811a-774c-4143-9852-a30ef0d555a4", # Marcos Garcia (cliente)
    solicitud_proyecto_id: "b1d6e8f4-7a0a-7a2d-e5f1-4d8a9a1a2f5e"
  },
  {
    id: "f5a0a2a8-1a4a-1a6a-a9a5-8a2a3a5a6a9a",
    titulo_proyecto: "Villa Campestre con Piscina",
    valoracion_promedio: 5.0,
    descripcion: "Diseño exclusivo de villa campestre de 400m2 con piscina infinity, 4 habitaciones con baño privado, sala de cine y cancha deportiva.",
    tipo_proyecto: "portafolio",
    fecha_publicacion: "2025-10-10",
    arquitecto_id: "b78ade33-f566-47e8-9266-85b1f97c72ea", # Maria Garcia (arquitecto)
    conversacion_id: nil,
    cliente_id: nil,
    solicitud_proyecto_id: nil
  },
  # Nuevos Proyectos con nuevos usuarios
  {
    id: "8f9a0b1c-2d3e-4f4a-5b6c-7d8e9f0a1b2c",
    titulo_proyecto: "Centro Comercial Moderno",
    valoracion_promedio: 4.6,
    descripcion: "Diseño integral de centro comercial de 3 niveles con 80 locales, amplios pasillos, zona de comidas y estacionamiento para 200 vehículos.",
    tipo_proyecto: "contratado",
    fecha_publicacion: "2025-10-22",
    arquitecto_id: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b", # Carlos Rodriguez (nuevo arquitecto)
    conversacion_id: "0d1e2f3a-4b5c-4d6e-7f8a-9b0c1d2e3f4a",
    cliente_id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", # Pedro Sanchez (nuevo cliente)
    solicitud_proyecto_id: "4b5c6d7e-8f9a-4b0c-1d2e-3f4a5b6c7d8e"
  },
  {
    id: "9a0b1c2d-3e4f-4a5b-6c7d-8e9f0a1b2c3d",
    titulo_proyecto: "Parque Urbano Sustentable",
    valoracion_promedio: 4.7,
    descripcion: "Proyecto de renovación urbana con parque lineal de 5 hectáreas, ciclovías, áreas de juegos infantiles y jardines botánicos.",
    tipo_proyecto: "portafolio",
    fecha_publicacion: "2025-10-20",
    arquitecto_id: "6f7a8b9c-0d1e-4f2a-3b4c-5d6e7f8a9b0c", # Ana Martinez (nueva arquitecta)
    conversacion_id: nil,
    cliente_id: nil,
    solicitud_proyecto_id: nil
  },
  {
    id: "0b1c2d3e-4f5a-4b6c-7d8e-9f0a1b2c3d4e",
    titulo_proyecto: "Restauración Casa Colonial",
    valoracion_promedio: 4.8,
    descripcion: "Restauración y conservación de casa colonial del siglo XVIII, manteniendo elementos originales y adaptando a normativas actuales.",
    tipo_proyecto: "contratado",
    fecha_publicacion: "2025-10-24",
    arquitecto_id: "7a8b9c0d-1e2f-4a3b-4c5d-6e7f8a9b0c1d", # Luis Fernandez (nuevo arquitecto)
    conversacion_id: "2f3a4b5c-6d7e-4f8a-9b0c-1d2e3f4a5b6c",
    cliente_id: "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f", # Miguel Torres (nuevo cliente)
    solicitud_proyecto_id: "6d7e8f9a-0b1c-4d2e-3f4a-5b6c7d8e9f0a"
  },
  {
    id: "1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f",
    titulo_proyecto: "Complejo Residencial Ecológico",
    valoracion_promedio: 4.9,
    descripcion: "Desarrollo de 15 viviendas unifamiliares con diseño bioclimático, paneles solares, captación de agua lluvia y jardines comunitarios.",
    tipo_proyecto: "contratado",
    fecha_publicacion: "2025-10-25",
    arquitecto_id: "8b9c0d1e-2f3a-4b4c-5d6e-7f8a9b0c1d2e", # Sofia Lopez (nueva arquitecta)
    conversacion_id: "3a4b5c6d-7e8f-4a9b-0c1d-2e3f4a5b6c7d",
    cliente_id: "4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a", # Carmen Ruiz (nueva cliente)
    solicitud_proyecto_id: "7e8f9a0b-1c2d-4e3f-4a5b-6c7d8e9f0a1b"
  }
])

puts "Proyectos creados."


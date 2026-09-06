puts "Creando avances de proyectos..."

Avance.create!([
  {
    id: "04a9b1c7-0d3e-0e5a-b8c4-7a1e2d4e5c8b",
    descripcion: "Fase 1 completada: Demolición de muros no estructurales y preparación del terreno para la construcción.",
    fecha: "2025-10-17",
    proyecto_id: "c2e7f9a5-8a1a-8a3e-f6a2-5e9a0a2a3a6f" # Casa Moderna
  },
  {
    id: "15b0c2d8-1e4f-1f6b-c9d5-8b2f3e5f6d9c",
    descripcion: "Fase 2: Estructura de hormigón armado completada. Se han levantado las columnas y vigas principales.",
    fecha: "2025-10-20",
    proyecto_id: "c2e7f9a5-8a1a-8a3e-f6a2-5e9a0a2a3a6f" # Casa Moderna
  },
  {
    id: "26c1d3e9-2f5a-2a7c-d0e6-9c3a4f6a7e0d",
    descripcion: "Avance en instalaciones eléctricas. Se ha completado el 60% del cableado y colocación de cajas.",
    fecha: "2025-10-22",
    proyecto_id: "c2e7f9a5-8a1a-8a3e-f6a2-5e9a0a2a3a6f" # Casa Moderna
  },
  {
    id: "37d2e4f0-3a6b-3b8d-e1f7-0d4b5a7b8f1e",
    descripcion: "Inicio de trabajos de remodelación. Demolición de cocina y baños antiguos completada.",
    fecha: "2025-10-19",
    proyecto_id: "e4a9a1a7-0a3a-0a5a-a8a4-7a1a2a4a5a8a" # Remodelación Apartamento
  },
  {
    id: "48e3f5a1-4b7c-4c9e-f2a8-1e5c6b8c9a2f",
    descripcion: "Instalación de nueva cocina integral y mesones de cuarzo. Trabajos de plomería al 80%.",
    fecha: "2025-10-21",
    proyecto_id: "e4a9a1a7-0a3a-0a5a-a8a4-7a1a2a4a5a8a" # Remodelación Apartamento
  },
  {
    id: "59f4a6b2-5c8d-5d0f-a3b9-2f6d7c9d0b3a",
    descripcion: "Pisos de porcelanato instalados en áreas principales. Pintura de paredes en proceso.",
    fecha: "2025-10-23",
    proyecto_id: "e4a9a1a7-0a3a-0a5a-a8a4-7a1a2a4a5a8a" # Remodelación Apartamento
  },
  # Nuevos Avances para nuevos proyectos
  {
    id: "2d3e4f5a-6b7c-4d8e-9f0a-1b2c3d4e5f6a",
    descripcion: "Fase inicial: Excavación y cimentación del centro comercial completada al 100%.",
    fecha: "2025-10-23",
    proyecto_id: "8f9a0b1c-2d3e-4f4a-5b6c-7d8e9f0a1b2c" # Centro Comercial Moderno
  },
  {
    id: "3e4f5a6b-7c8d-4e9f-0a1b-2c3d4e5f6a7b",
    descripcion: "Estructura metálica del primer nivel levantada. Instalación de vigas principales en curso.",
    fecha: "2025-10-26",
    proyecto_id: "8f9a0b1c-2d3e-4f4a-5b6c-7d8e9f0a1b2c" # Centro Comercial Moderno
  },
  {
    id: "4f5a6b7c-8d9e-4f0a-1b2c-3d4e5f6a7b8c",
    descripcion: "Limpieza y consolidación de muros originales de la casa colonial. Análisis estructural completado.",
    fecha: "2025-10-25",
    proyecto_id: "0b1c2d3e-4f5a-4b6c-7d8e-9f0a1b2c3d4e" # Restauración Casa Colonial
  },
  {
    id: "5a6b7c8d-9e0f-4a1b-2c3d-4e5f6a7b8c9d",
    descripcion: "Restauración de techos de teja y vigas de madera según técnicas tradicionales.",
    fecha: "2025-10-28",
    proyecto_id: "0b1c2d3e-4f5a-4b6c-7d8e-9f0a1b2c3d4e" # Restauración Casa Colonial
  },
  {
    id: "6b7c8d9e-0f1a-4b2c-3d4e-5f6a7b8c9d0e",
    descripcion: "Urbanización del complejo iniciada. Instalación de redes de agua y electricidad subterráneas.",
    fecha: "2025-10-26",
    proyecto_id: "1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f" # Complejo Residencial Ecológico
  },
  {
    id: "7c8d9e0f-1a2b-4c3d-4e5f-6a7b8c9d0e1f",
    descripcion: "Construcción de las primeras 5 viviendas. Instalación de paneles solares en 3 unidades.",
    fecha: "2025-10-29",
    proyecto_id: "1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f" # Complejo Residencial Ecológico
  }
])

puts "Avances de proyectos creados."


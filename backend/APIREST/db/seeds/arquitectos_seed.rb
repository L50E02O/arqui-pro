puts "Creando Arquitectos..."

Arquitecto.create!([
  {
    id: "b78ade33-f566-47e8-9266-85b1f97c72ea",
    cedula: "1309817462",
    valoracion_prom_proyecto: 20.4,
    descripcion: "Soy una arquitecta que le gusta hacer casas",
    especialidades: "Arquitectura Residencial, Diseño Sostenible",
    ubicacion: "Manta-Manabí-Ecuador",
    verificado: false,
    vistas_perfil: 37,
    usuario_id: "6954e4dd-f142-402c-9351-44b28a3526e6",
  },
  {
    id: "2f2a0e35-7d47-4bc8-b1fb-5a31b1de64a1",
    cedula: "1309817461",
    valoracion_prom_proyecto: 20.4,
    descripcion: "Solo soy un arquitecto, nada mas que decir",
    especialidades: "Comercial, Paisajismo y Urbanismo",
    ubicacion: "Manta-Manabí-Ecuador",
    verificado: true,
    vistas_perfil: 42,
    usuario_id: "91edb463-17d0-4ab9-9e3d-6e83a4c31de4",
  },
  # Nuevos Arquitectos
  {
    id: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b",
    cedula: "1310241003",
    valoracion_prom_proyecto: 4.5,
    descripcion: "Especialista en espacios comerciales modernos y funcionales.",
    especialidades: "Arquitectura Comercial, Retail Design",
    ubicacion: "Medellín-Antioquia-Colombia",
    verificado: true,
    vistas_perfil: 28,
    usuario_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  },
  {
    id: "6f7a8b9c-0d1e-4f2a-3b4c-5d6e7f8a9b0c",
    cedula: "1310241004",
    valoracion_prom_proyecto: 4.7,
    descripcion: "Experta en planificación urbana y espacios públicos.",
    especialidades: "Diseño Urbano, Espacios Públicos",
    ubicacion: "Cali-Valle del Cauca-Colombia",
    verificado: true,
    vistas_perfil: 35,
    usuario_id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
  },
  {
    id: "7a8b9c0d-1e2f-4a3b-4c5d-6e7f8a9b0c1d",
    cedula: "1310241005",
    valoracion_prom_proyecto: 4.3,
    descripcion: "Arquitecto dedicado a la conservación y restauración de edificios históricos.",
    especialidades: "Restauración Patrimonial, Conservación",
    ubicacion: "Cartagena-Bolívar-Colombia",
    verificado: false,
    vistas_perfil: 19,
    usuario_id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
  },
  {
    id: "8b9c0d1e-2f3a-4b4c-5d6e-7f8a9b0c1d2e",
    cedula: "1310241006",
    valoracion_prom_proyecto: 4.8,
    descripcion: "Especialista en diseño sustentable adaptado al clima tropical.",
    especialidades: "Arquitectura Bioclimática, Diseño Sostenible",
    ubicacion: "Barranquilla-Atlántico-Colombia",
    verificado: true,
    vistas_perfil: 41,
    usuario_id: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
  }
])

puts "Arquitectos creados."
puts "Creando incidencias..."

Incidencia.create!([
  {
    id: "c3d8a0b6-9c2e-9d4a-a7b3-6a0e1c3d4b7a",
    descripcion: "El usuario ha enviado contenido inapropiado en mensajes privados a otros miembros de la plataforma.",
    estado: "en revision",
    fecha: "2025-10-21",
    usuario_emisor_id: "5af9923c-27c9-4fdc-9221-d7b8e416e487", # Marcos Garcia (reporta)
    usuario_infractor_id: "384fe367-90c2-4a70-b63f-8e64e9bb1d80", # Juan Macias (infractor)
    moderador_id: "d1c4e8b2-3f4a-4e2b-9f7e-5c6d7e8f9a0b" # Mateo Velez (moderador)
  },
  {
    id: "d4a9b1c7-0d3f-0e5a-b8c4-7a1f2d4e5c8b",
    descripcion: "Intento de estafa reportado. El arquitecto solicitó pago adelantado sin contrato formal.",
    estado: "resuelto",
    fecha: "2025-10-18",
    usuario_emisor_id: "384fe367-90c2-4a70-b63f-8e64e9bb1d80", # Juan Macias (reporta)
    usuario_infractor_id: "91edb463-17d0-4ab9-9e3d-6e83a4c31de4", # Joaquin Palacios (infractor)
    moderador_id: "0f3f4cdc-ef7f-45d7-ae82-1900ecf227c7" # Pepe Velez (moderador)
  },
  {
    id: "e5b0c2d8-1e4a-1f6b-c9d5-8b2a3e5f6d9c",
    descripcion: "Contenido plagiado detectado en el portafolio del arquitecto. Imágenes copiadas de otros sitios web.",
    estado: "pendiente",
    fecha: "2025-10-23",
    usuario_emisor_id: "6954e4dd-f142-402c-9351-44b28a3526e6", # Maria Garcia (reporta)
    usuario_infractor_id: "91edb463-17d0-4ab9-9e3d-6e83a4c31de4", # Joaquin Palacios (infractor)
    moderador_id: "d1c4e8b2-3f4a-4e2b-9f7e-5c6d7e8f9a0b" # Mateo Velez (moderador)
  },
  # Nuevas Incidencias con nuevos usuarios
  {
    id: "9c0d1e2f-3a4b-4c5d-6e7f-8a9b0c1d2e3a",
    descripcion: "Lenguaje ofensivo en comentarios públicos del arquitecto hacia otros profesionales.",
    estado: "en revision",
    fecha: "2025-10-25",
    usuario_emisor_id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b", # Pedro Sanchez (reporta)
    usuario_infractor_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d", # Carlos Rodriguez (infractor)
    moderador_id: "9c0d1e2f-3a4b-4c5d-6e7f-8a9b0c1d2e3f" # Ricardo Morales (nuevo moderador)
  },
  {
    id: "0d1e2f3a-4b5c-4d6e-7f8a-9b0c1d2e3f4b",
    descripcion: "Cliente no cumplió con pagos acordados después de completar el 70% del proyecto.",
    estado: "resuelto",
    fecha: "2025-10-26",
    usuario_emisor_id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e", # Ana Martinez (reporta)
    usuario_infractor_id: "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c", # Laura Gomez (infractor)
    moderador_id: "0f3f4cdc-ef7f-45d7-ae82-1900ecf227c7" # Pepe Velez (moderador)
  },
  {
    id: "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5c",
    descripcion: "Spam masivo en mensajes privados promocionando servicios no relacionados con arquitectura.",
    estado: "pendiente",
    fecha: "2025-10-27",
    usuario_emisor_id: "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d", # Miguel Torres (reporta)
    usuario_infractor_id: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a", # Sofia Lopez (infractor)
    moderador_id: "9c0d1e2f-3a4b-4c5d-6e7f-8a9b0c1d2e3f" # Ricardo Morales (nuevo moderador)
  }
])

puts "Incidencias creadas."


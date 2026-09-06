puts "Creando mensajes..."

Mensaje.create!([
  {
    id: "a6b1c3d9-2e5a-2a7b-c0d6-9b3a4e6a7d0c",
    contenido: "Hola Maria, me interesa tu trabajo. ¿Podrías ayudarme con el diseño de mi casa?",
    fecha_envio: "2025-10-15",
    leido: true,
    conversacion_id: "79f484bb-ea90-464e-8666-4cc69c3fe3b4",
    remitente_id: "5af9923c-27c9-4fdc-9221-d7b8e416e487" # Marcos Garcia (usuario)
  },
  {
    id: "b7c2d4e0-3f6b-3b8c-d1e7-0c4b5f7b8e1d",
    contenido: "¡Claro que sí! Cuéntame más sobre lo que tienes en mente. ¿Qué estilo te gusta?",
    fecha_envio: "2025-10-15",
    leido: true,
    conversacion_id: "79f484bb-ea90-464e-8666-4cc69c3fe3b4",
    remitente_id: "6954e4dd-f142-402c-9351-44b28a3526e6" # Maria Garcia (usuario)
  },
  {
    id: "c8d3e5f1-4a7c-4c9d-e2f8-1d5c6a8c9f2e",
    contenido: "Me gusta el estilo moderno, con mucha luz natural y espacios abiertos.",
    fecha_envio: "2025-10-15",
    leido: true,
    conversacion_id: "79f484bb-ea90-464e-8666-4cc69c3fe3b4",
    remitente_id: "5af9923c-27c9-4fdc-9221-d7b8e416e487" # Marcos Garcia (usuario)
  },
  {
    id: "d9e4f6a2-5b8d-5d0e-f3a9-2e6d7b9d0a3f",
    contenido: "Perfecto. Tengo algunas ideas que podrían funcionarte muy bien. ¿Cuándo podemos reunirnos?",
    fecha_envio: "2025-10-15",
    leido: true,
    conversacion_id: "79f484bb-ea90-464e-8666-4cc69c3fe3b4",
    remitente_id: "6954e4dd-f142-402c-9351-44b28a3526e6" # Maria Garcia (usuario)
  },
  {
    id: "e0f5a7b3-6c9e-6e1f-a4b0-3f7e8c0e1b4a",
    contenido: "Buenos días Joaquin, necesito renovar mi apartamento. ¿Tienes disponibilidad?",
    fecha_envio: "2025-10-17",
    leido: true,
    conversacion_id: "a1c5f8e2-3b6e-4f9d-9c3e-2f4b5d6e7f8a",
    remitente_id: "5af9923c-27c9-4fdc-9221-d7b8e416e487" # Marcos Garcia (usuario)
  },
  {
    id: "f1a6b8c4-7d0f-7f2a-b5c1-4a8f9d1f2c5b",
    contenido: "¡Hola! Sí, tengo disponibilidad. Cuéntame más detalles del proyecto.",
    fecha_envio: "2025-10-17",
    leido: true,
    conversacion_id: "a1c5f8e2-3b6e-4f9d-9c3e-2f4b5d6e7f8a",
    remitente_id: "91edb463-17d0-4ab9-9e3d-6e83a4c31de4" # Joaquin Palacios (usuario)
  },
  {
    id: "a2b7c9d5-8e1a-8a3b-c6d2-5b9a0e2a3d6c",
    contenido: "Es un apartamento de 120m2. Quiero renovar cocina, baños y cambiar pisos.",
    fecha_envio: "2025-10-17",
    leido: false,
    conversacion_id: "a1c5f8e2-3b6e-4f9d-9c3e-2f4b5d6e7f8a",
    remitente_id: "5af9923c-27c9-4fdc-9221-d7b8e416e487" # Marcos Garcia (usuario)
  },
  {
    id: "b3c8d0e6-9f2b-9b4c-d7e3-6c0b1f3b4e7d",
    contenido: "Hola, vi tu perfil y me interesa trabajar contigo en un proyecto comercial.",
    fecha_envio: "2025-10-20",
    leido: false,
    conversacion_id: "a1c5f8e2-3b6e-4f9d-9c3e-2f4b5d6e7f8a",
    remitente_id: "384fe367-90c2-4a70-b63f-8e64e9bb1d80" # Juan Macias (usuario)
  },
  # Nuevos Mensajes con nuevos usuarios
  {
    id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5e",
    contenido: "Hola Carlos, me gustaría que diseñaras un centro comercial. ¿Tienes experiencia en eso?",
    fecha_envio: "2025-10-20",
    leido: true,
    conversacion_id: "0d1e2f3a-4b5c-4d6e-7f8a-9b0c1d2e3f4a",
    remitente_id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b" # Pedro Sanchez (nuevo usuario)
  },
  {
    id: "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6f",
    contenido: "¡Hola Pedro! Sí, tengo amplia experiencia en proyectos comerciales. Cuéntame más detalles.",
    fecha_envio: "2025-10-20",
    leido: true,
    conversacion_id: "0d1e2f3a-4b5c-4d6e-7f8a-9b0c1d2e3f4a",
    remitente_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d" # Carlos Rodriguez (nuevo usuario)
  },
  {
    id: "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7a",
    contenido: "Ana, necesito diseño urbano para un proyecto de renovación. ¿Puedes ayudarme?",
    fecha_envio: "2025-10-21",
    leido: true,
    conversacion_id: "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b",
    remitente_id: "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c" # Laura Gomez (nueva usuario)
  },
  {
    id: "4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8b",
    contenido: "¡Claro que sí! El diseño urbano es mi especialidad. ¿De qué zona hablamos?",
    fecha_envio: "2025-10-21",
    leido: true,
    conversacion_id: "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b",
    remitente_id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e" # Ana Martinez (nueva usuario)
  },
  {
    id: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9c",
    contenido: "Luis, tengo una casa colonial que necesita restauración. ¿Te interesa el proyecto?",
    fecha_envio: "2025-10-22",
    leido: true,
    conversacion_id: "2f3a4b5c-6d7e-4f8a-9b0c-1d2e3f4a5b6c",
    remitente_id: "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d" # Miguel Torres (nuevo usuario)
  },
  {
    id: "6f7a8b9c-0d1e-4f2a-3b4c-5d6e7f8a9b0d",
    contenido: "¡Me encantaría! La restauración patrimonial es mi pasión. ¿Cuándo podemos verla?",
    fecha_envio: "2025-10-22",
    leido: true,
    conversacion_id: "2f3a4b5c-6d7e-4f8a-9b0c-1d2e3f4a5b6c",
    remitente_id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f" # Luis Fernandez (nuevo usuario)
  },
  {
    id: "7a8b9c0d-1e2f-4a3b-4c5d-6e7f8a9b0c1e",
    contenido: "Sofia, necesito un complejo residencial ecológico. ¿Puedes ayudarme con el diseño?",
    fecha_envio: "2025-10-23",
    leido: true,
    conversacion_id: "3a4b5c6d-7e8f-4a9b-0c1d-2e3f4a5b6c7d",
    remitente_id: "b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e" # Carmen Ruiz (nueva usuario)
  },
  {
    id: "8b9c0d1e-2f3a-4b4c-5d6e-7f8a9b0c1d2f",
    contenido: "¡Por supuesto! La arquitectura bioclimática es lo mío. Hagamos algo increíble juntas.",
    fecha_envio: "2025-10-23",
    leido: true,
    conversacion_id: "3a4b5c6d-7e8f-4a9b-0c1d-2e3f4a5b6c7d",
    remitente_id: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a" # Sofia Lopez (nueva usuario)
  }
])

puts "Mensajes creados."


puts "Creando Notificaciones..."

Notificacion.create!([
  {
    id: "8a2f6c1d-cff9-4f6e-bca8-927fd651a2d6",
    mensaje: "Esta es una notificacion para otro usuario",
    fecha: "2025-10-12",
    leido: false,
    usuario_id: "6954e4dd-f142-402c-9351-44b28a3526e6"
  },
  {
    id: "03f637b4-d3a5-4a6a-bea0-e7b9ba109113",
    mensaje: "Esta es una notificacion para otro usuario",
    fecha: "2025-10-12",
    leido: true,
    usuario_id: "6954e4dd-f142-402c-9351-44b28a3526e6"
  },
  {
    id: "d0ab1297-bf7a-4561-b630-b6b89a95514e",
    mensaje: "Esta es una notificacion actualizada",
    fecha: "2025-10-12",
    leido: false,
    usuario_id: "6954e4dd-f142-402c-9351-44b28a3526e6"
  },
  # Nuevas Notificaciones con nuevos usuarios
  {
    id: "2f3a4b5c-6d7e-4f8a-9b0c-1d2e3f4a5b6d",
    mensaje: "Tu solicitud de proyecto ha sido aceptada por Carlos Rodriguez.",
    fecha: "2025-10-21",
    leido: false,
    usuario_id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b" # Pedro Sanchez
  },
  {
    id: "3a4b5c6d-7e8f-4a9b-0c1d-2e3f4a5b6c7e",
    mensaje: "Tienes un nuevo mensaje en tu conversación con Ana Martinez.",
    fecha: "2025-10-21",
    leido: true,
    usuario_id: "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c" # Laura Gomez
  },
  {
    id: "4b5c6d7e-8f9a-4b0c-1d2e-3f4a5b6c7d8f",
    mensaje: "El cliente Miguel Torres ha valorado tu proyecto con 4.8 estrellas.",
    fecha: "2025-10-30",
    leido: false,
    usuario_id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f" # Luis Fernandez
  },
  {
    id: "5c6d7e8f-9a0b-4c1d-2e3f-4a5b6c7d8e9a",
    mensaje: "Tu cuenta de arquitecto ha sido verificada exitosamente.",
    fecha: "2025-10-22",
    leido: true,
    usuario_id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d" # Carlos Rodriguez
  },
  {
    id: "6d7e8f9a-0b1c-4d2e-3f4a-5b6c7d8e9f0b",
    mensaje: "Tienes un nuevo avance en tu proyecto: Complejo Residencial Ecológico.",
    fecha: "2025-10-29",
    leido: false,
    usuario_id: "b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e" # Carmen Ruiz
  }
])

puts "Notificaciones creadas."
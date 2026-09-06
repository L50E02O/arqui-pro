puts "Creando usuarios..."

require 'bcrypt'

# Helper para generar password encriptado compatible con Devise
def generar_password_encriptado(password)
  BCrypt::Password.create(password, cost: 12)
end

Usuario.create!([
    {
      id: "5af9923c-27c9-4fdc-9221-d7b8e416e487",
      nombre: "Marcos",
      apellido: "Garcia",
      email: "marcos@gmail.com",
      estado_cuenta: "activo",
      # encrypted_password: generar_password_encriptado("123456"),
      password: "123456",
      rol: "cliente",
      fecha_registro: "2025-10-09",
      foto_perfil: "https://i.pravatar.cc/300?img=1",
      jti: SecureRandom.uuid,
      remember_created_at: nil
  },
  {
      id: "6954e4dd-f142-402c-9351-44b28a3526e6",
      nombre: "Maria",
      apellido: "Garcia",
      email: "maria@gmail.com",
      estado_cuenta: "activo",
      #encrypted_password: generar_password_encriptado("123456"),
      password: "123456",
      rol: "arquitecto",
      fecha_registro: "2025-10-09",
      foto_perfil: "https://i.pravatar.cc/300?img=5",
      jti: SecureRandom.uuid,
      remember_created_at: nil
  },
  {
      id: "91edb463-17d0-4ab9-9e3d-6e83a4c31de4",
      nombre: "Joaquin",
      apellido: "Palacios",
      email: "joaquin@gmail.com",
      estado_cuenta: "activo",
      #encrypted_password: generar_password_encriptado("123456"),
      password: "123456",
      rol: "arquitecto",
      fecha_registro: "2025-10-11",
      foto_perfil: "https://i.pravatar.cc/300?img=12",
      jti: SecureRandom.uuid,
      remember_created_at: nil
  },
  {
      id: "384fe367-90c2-4a70-b63f-8e64e9bb1d80",
      nombre: "Juan",
      apellido: "Macias",
      email: "juan@gmail.com",
      estado_cuenta: "activo",
      # encrypted_password: generar_password_encriptado("123456"),
      password: "123456",
      rol: "cliente",
      fecha_registro: "2025-10-08",
      foto_perfil: "https://i.pravatar.cc/300?img=7",
      jti: SecureRandom.uuid,
      remember_created_at: nil
  },
  {
      id: "464e2a37-2df2-40b3-b213-f4f976e972b8",
      nombre: "Mateo",
      apellido: "Velez",
      email: "mateo@gmail.com",
      estado_cuenta: "activo",
      encrypted_password: generar_password_encriptado("123456"),
      password: "123456",
      rol: "moderador",
      fecha_registro: "2025-10-11",
      foto_perfil: "https://i.pravatar.cc/300?img=15",
      jti: SecureRandom.uuid,
      remember_created_at: nil
  },
  {
      id: "8188c049-b43b-43a5-b048-4efedfe2536f",
      nombre: "Pepe",
      apellido: "Velez",
      email: "pepe@gmail.com",
      estado_cuenta: "activo",
    #   encrypted_password: generar_password_encriptado("123456"),
      password: "123456",
      rol: "moderador",
      fecha_registro: "2025-10-11",
      foto_perfil: "https://i.pravatar.cc/300?img=33",
      jti: SecureRandom.uuid,
      remember_created_at: nil
  },
  # Nuevos Usuarios - 4 Arquitectos
  {
      id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      nombre: "Carlos",
      apellido: "Rodriguez",
      email: "carlos.rodriguez@gmail.com",
      estado_cuenta: "activo",
    #   encrypted_password: generar_password_encriptado("123456"),
      password: "123456",
      rol: "arquitecto",
      fecha_registro: "2025-10-12",
      foto_perfil: "https://i.pravatar.cc/300?img=8",
      jti: SecureRandom.uuid,
      remember_created_at: nil
  },
  {
      id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
      nombre: "Ana",
      apellido: "Martinez",
      email: "ana.martinez@gmail.com",
      estado_cuenta: "activo",
    #   encrypted_password: generar_password_encriptado("123456"),
      password: "123456",
      rol: "arquitecto",
      fecha_registro: "2025-10-13",
      foto_perfil: "https://i.pravatar.cc/300?img=9",
      jti: SecureRandom.uuid,
      remember_created_at: nil
  },
  {
      id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
      nombre: "Luis",
      apellido: "Fernandez",
      email: "luis.fernandez@gmail.com",
      estado_cuenta: "activo",
    #   encrypted_password: generar_password_encriptado("123456"),
      password: "123456",
      rol: "arquitecto",
      fecha_registro: "2025-10-14",
      foto_perfil: "https://i.pravatar.cc/300?img=11",
      jti: SecureRandom.uuid,
      remember_created_at: nil
  },
  {
      id: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
      nombre: "Sofia",
      apellido: "Lopez",
      email: "sofia.lopez@gmail.com",
      estado_cuenta: "activo",
    #   encrypted_password: generar_password_encriptado("123456"),
      password: "123456",
      rol: "arquitecto",
      fecha_registro: "2025-10-15",
      foto_perfil: "https://i.pravatar.cc/300?img=10",
      jti: SecureRandom.uuid,
      remember_created_at: nil
  },
  # Nuevos Usuarios - 4 Clientes
  {
      id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
      nombre: "Pedro",
      apellido: "Sanchez",
      email: "pedro.sanchez@gmail.com",
      estado_cuenta: "activo",
    #   encrypted_password: generar_password_encriptado("123456"),
      password: "123456",
      rol: "cliente",
      fecha_registro: "2025-10-16",
      foto_perfil: "https://i.pravatar.cc/300?img=13",
      jti: SecureRandom.uuid,
      remember_created_at: nil
  },
  {
      id: "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c",
      nombre: "Laura",
      apellido: "Gomez",
      email: "laura.gomez@gmail.com",
      estado_cuenta: "activo",
    #   encrypted_password: generar_password_encriptado("123456"),
      password: "123456",
      rol: "cliente",
      fecha_registro: "2025-10-17",
      foto_perfil: "https://i.pravatar.cc/300?img=16",
      jti: SecureRandom.uuid,
      remember_created_at: nil
  },
  {
      id: "a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d",
      nombre: "Miguel",
      apellido: "Torres",
      email: "miguel.torres@gmail.com",
      estado_cuenta: "activo",
    #   encrypted_password: generar_password_encriptado("123456"),
      password: "123456",
      rol: "cliente",
      fecha_registro: "2025-10-18",
      foto_perfil: "https://i.pravatar.cc/300?img=14",
      jti: SecureRandom.uuid,
      remember_created_at: nil
  },
  {
      id: "b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e",
      nombre: "Carmen",
      apellido: "Ruiz",
      email: "carmen.ruiz@gmail.com",
      estado_cuenta: "activo",
    #   encrypted_password: generar_password_encriptado("123456"),
      password: "123456",
      rol: "cliente",
      fecha_registro: "2025-10-19",
      foto_perfil: "https://i.pravatar.cc/300?img=20",
      jti: SecureRandom.uuid,
      remember_created_at: nil
  },
  # Nuevo Usuario - 1 Moderador
  {
      id: "c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f",
      nombre: "Ricardo",
      apellido: "Morales",
      email: "ricardo.morales@gmail.com",
      estado_cuenta: "activo",
    #   encrypted_password: generar_password_encriptado("123456"),
      password: "123456",
      rol: "moderador",
      fecha_registro: "2025-10-20",
      foto_perfil: "https://i.pravatar.cc/300?img=17",
      jti: SecureRandom.uuid,
      remember_created_at: nil
  }
])

puts "Usuarios creados."
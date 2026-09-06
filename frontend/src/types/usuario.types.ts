import type { RegistroArquitectoAttributesInput } from "./arquitecto.types"
import type { RegistroClienteAttributesInput } from "./cliente.types"

// Usuario Base Type
export interface Usuario {
  id: string
  nombre: string
  apellido: string
  email: string
  estado_cuenta: 'activo' | 'suspendido'
  rol: 'arquitecto' | 'cliente' | 'moderador'
  fecha_registro: string
  foto_perfil: string | null
}

// Auth Types
export interface LoginInput {
  email: string
  password: string
}

export interface RegistroUsuarioInput {
  nombre: string
  apellido: string
  email: string
  password: string
  password_confirmation: string
  rol: 'arquitecto' | 'cliente' | 'moderador'
  arquitecto_attributes?: RegistroArquitectoAttributesInput
  cliente_attributes?: RegistroClienteAttributesInput
}

export interface AuthResponse {
  usuario: Usuario
  token: string
}

export interface AuthState {
  usuario: Usuario | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

import type { Usuario } from './usuario.types'

// Cliente Type
export interface Cliente {
  id: string
  usuario_id: string
  cedula: string
  usuario?: Usuario
}

export interface UpdateClienteDto{
  cedula?: string
}

export interface RegistroClienteAttributesInput {
  cedula: string
}

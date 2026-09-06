import type { Conversacion } from './conversacion.types'
import type { Usuario } from './usuario.types'

// Imagen Type
export interface Imagen {
  id: string
  imagen_url: string
  fecha: string
}

// Mensaje Type
export interface Mensaje {
  id: string
  contenido: string
  fecha_envio: string
  hora_envio?: string
  leido: boolean
  remitente_id: string
  conversacion_id: string
  remitente?: Usuario
  conversacion?: Conversacion
  imagenes?: Imagen[]
}

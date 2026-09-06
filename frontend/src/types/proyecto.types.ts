import type { Arquitecto } from './arquitecto.types'
import type { Avance } from './avance.types'
import type { Cliente } from './cliente.types'
import type { Imagen } from './imagen.types'

// Proyecto Type
export interface Proyecto {
  id: string
  titulo_proyecto: string
  descripcion: string
  tipo_proyecto: 'portafolio' | 'contratado'
  fecha_publicacion: Date
  valoracion_promedio: number
  arquitecto_id: string
  cliente_id?: string | null
  conversacion_id?: string
  solicitud_proyecto_id?: string
  arquitecto?: Arquitecto
  cliente?: Cliente
  imagenes?: Imagen[]
  avances?: Avance[]
}

export interface CreateProyectoDto{
  titulo_proyecto: string
  descripcion: string
  tipo_proyecto: 'portafolio' | 'contratado'
  arquitecto_id: string
  cliente_id: string | null
}

export interface UpdateProyectoDto{
  titulo_proyecto?: string
  descripcion?: string
  tipo_proyecto?: 'portafolio' | 'contratado'
  fecha_publicacion?: Date
  valoracion_promedio?: number
  arquitecto_id?: string
  cliente_id?: string | null
  conversacion_id?: string
  solicitud_proyecto_id?: string
}
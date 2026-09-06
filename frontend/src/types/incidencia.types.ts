import type { Usuario } from './usuario.types'
import type { Moderador } from './moderador.types'
import type { Imagen } from './imagen.types'

// Incidencia Type
export interface Incidencia {
  id: string
  titulo?: string
  descripcion: string
  estado: 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado' | 'en revision'
  prioridad?: 'baja' | 'media' | 'alta' | 'urgente'
  tipo?: string
  usuario_id?: string
  usuario_emisor_id?: string
  usuario_infractor_id?: string
  moderador_id?: string | null
  proyecto_id?: string
  imagenes?: string[] | Imagen[]
  created_at?: string
  updated_at?: string
  usuario_emisor?: Usuario
  usuario_infractor?: Usuario
  moderador?: Moderador
}

export interface CreateIncidenciaDto{
  descripcion: string
  estado: 'pendiente' | 'resuelto' | 'en revision'
  usuario_emisor_id: string
  usuario_infractor_id: string
  moderador_id: string | null
}

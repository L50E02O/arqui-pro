import type { Arquitecto } from './arquitecto.types'
import type { Moderador } from './moderador.types'

// Verificación Type
export interface Verificacion {
  id: string
  estado: 'pendiente' | 'verificado' | 'rechazado'
  arquitecto_id: string
  moderador_id: string | null
  arquitecto?: Arquitecto
  moderador?: Moderador
}

export interface UpdateVerificacionDto{
  estado?: 'pendiente' | 'verificado' | 'rechazado'
  arquitecto_id?: string
  moderador_id?: string | null
  arquitecto?: Arquitecto
  moderador?: Moderador 
}

export interface CrateVerificacionDto{
  estado: 'pendiente' | 'verificado' | 'rechazado'
  arquitecto_id: string
  moderador_id: string | null 
}

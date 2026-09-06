import type { Imagen } from './imagen.types'
import type { Proyecto } from './proyecto.types'

// Avance Type
export interface Avance {
  id: string
  descripcion: string
  fecha: string
  proyecto_id: string
  proyecto?: Proyecto
  imagenes?: Imagen[]
}

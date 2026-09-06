import type { Arquitecto } from './arquitecto.types'
import type { Cliente } from './cliente.types'
import type { Proyecto } from './proyecto.types'

// Solicitud de Proyecto Type
export interface SolicitudProyecto {
  id: string
  titulo_proyecto: string
  descripcion: string
  estado: 'pendiente' | 'aceptado' | 'rechazado'
  cliente_id: string
  arquitecto_id: string
  proyecto_id: string | null
  cliente?: Cliente
  arquitecto?: Arquitecto
  proyecto?: Proyecto
}

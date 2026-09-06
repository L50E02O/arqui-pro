// Imagen Type
export interface Imagen {
  id: string
  imagen_url: string
  fecha: string
  imagen_asociaciones_attributes?: ImagenAsociacionAttributes[]
}

// Imagen Asociación (Polimórfica)
export interface ImagenAsociacion {
  id: string
  imagen_id: string
  asociable_type: 'Proyecto' | 'Mensaje' | 'Incidencia' | 'Avance'
  asociable_id: string
  imagen?: Imagen
}

export interface ImagenAsociacionAttributes{
  asociable_type: 'Proyecto' | 'Mensaje' | 'Incidencia' | 'Avance'
  asociable_id: string
}

export interface CreateImagenDto{
  imagen_url: string
  fecha: string
  imagen_asociaciones_attributes: ImagenAsociacionAttributes[]  
}
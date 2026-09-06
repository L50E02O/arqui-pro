import strawberry
from typing import Optional


@strawberry.type
class ProyectoType:
    id: strawberry.ID
    titulo_proyecto: str
    valoracion_promedio: float
    descripcion: str
    tipo_proyecto: str
    fecha_publicacion: str  # ISO 8601 string
    arquitecto_id: strawberry.ID
    conversacion_id: Optional[strawberry.ID]
    cliente_id: Optional[strawberry.ID]
    solicitud_proyecto_id: Optional[strawberry.ID]



# Sin inputs: no hay mutaciones en el esquema actual

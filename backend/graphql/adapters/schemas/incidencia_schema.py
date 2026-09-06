import strawberry
from typing import Optional


@strawberry.type
class IncidenciaType:
    id: strawberry.ID
    descripcion: str
    estado: str
    fecha: str  # ISO 8601 string
    usuario_emisor_id: strawberry.ID
    usuario_infractor_id: strawberry.ID
    moderador_id: Optional[strawberry.ID]

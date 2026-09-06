import strawberry
from typing import Optional


@strawberry.type
class MensajeType:
    id: strawberry.ID
    contenido: str
    fecha_envio: str  # ISO 8601 string
    leido: bool
    conversacion_id: strawberry.ID
    remitente_id: strawberry.ID

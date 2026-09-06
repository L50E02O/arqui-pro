import strawberry
from datetime import date
from typing import Optional


@strawberry.type
class NotificacionType:
    id: strawberry.ID
    mensaje: str
    fecha: date
    leido: bool
    usuario_id: strawberry.ID

import strawberry
from datetime import date


@strawberry.type
class VerificacionType:
    id: strawberry.ID
    estado: str
    fecha_verificacion: date
    arquitecto_id: strawberry.ID
    moderador_id: strawberry.ID

import strawberry
from datetime import date


@strawberry.type
class ImagenType:
    id: strawberry.ID
    imagen_url: str
    fecha: date

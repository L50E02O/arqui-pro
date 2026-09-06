import strawberry


@strawberry.type
class AvanceType:
    id: strawberry.ID
    descripcion: str
    fecha: str  # ISO 8601 string
    proyecto_id: strawberry.ID

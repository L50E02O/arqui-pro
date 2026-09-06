import strawberry


@strawberry.type
class ValoracionType:
    id: strawberry.ID
    calificacion: float
    comentario: str
    fecha: str  # ISO 8601 string
    cliente_id: strawberry.ID
    proyecto_id: strawberry.ID

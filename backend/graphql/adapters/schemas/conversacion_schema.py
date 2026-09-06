import strawberry


@strawberry.type
class ConversacionType:
    id: strawberry.ID
    fecha: str  # ISO 8601 string
    cliente_id: strawberry.ID
    arquitecto_id: strawberry.ID


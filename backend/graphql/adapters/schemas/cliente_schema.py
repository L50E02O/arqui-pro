import strawberry


@strawberry.type
class ClienteType:
    id: strawberry.ID
    cedula: str
    usuario_id: strawberry.ID


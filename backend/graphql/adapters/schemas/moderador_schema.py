import strawberry


@strawberry.type
class ModeradorType:
    id: strawberry.ID
    usuario_id: strawberry.ID
    num_incidencias_resueltas: int
    num_arquitectos_verificados: int

import strawberry


@strawberry.type
class ArquitectoType:
    id: strawberry.ID
    cedula: str
    valoracion_prom_proyecto: float
    descripcion: str
    especialidades: str
    ubicacion: str
    verificado: bool
    vistas_perfil: int
    usuario_id: strawberry.ID


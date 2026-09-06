import strawberry
from typing import Optional


@strawberry.type
class UsuarioType:
    id: strawberry.ID
    nombre: str
    apellido: str
    email: str
    estado_cuenta: str
    rol: str
    fecha_registro: Optional[str]  # El API REST devuelve string ISO 8601
    foto_perfil: Optional[str]

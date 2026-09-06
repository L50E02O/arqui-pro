"""
Tipos para dashboard de proyecto.
"""
import strawberry
from typing import Optional, List
from adapters.schemas.arquitecto_schema import ArquitectoType
from adapters.schemas.usuario_schema import UsuarioType
from adapters.schemas.cliente_schema import ClienteType
from adapters.schemas.proyecto_schema import ProyectoType
from adapters.schemas.avance_schema import AvanceType
from adapters.schemas.valoracion_schema import ValoracionType


@strawberry.type
class DashboardProyecto:
    """Dashboard completo de un proyecto con toda la información relevante"""
    proyecto: ProyectoType
    arquitecto: ArquitectoType
    arquitecto_usuario: UsuarioType
    cliente: Optional[ClienteType]
    cliente_usuario: Optional[UsuarioType]
    avances: List[AvanceType]
    valoraciones: List[ValoracionType]
    total_avances: int
    valoracion_promedio: float

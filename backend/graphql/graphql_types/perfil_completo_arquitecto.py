"""
Tipos para consultas de información agregada.
"""
import strawberry
from typing import List
from adapters.schemas.arquitecto_schema import ArquitectoType
from adapters.schemas.usuario_schema import UsuarioType
from adapters.schemas.proyecto_schema import ProyectoType


@strawberry.type
class PerfilCompletoArquitecto:
    """Perfil completo de un arquitecto con toda su información relacionada"""
    arquitecto: ArquitectoType
    usuario: UsuarioType
    proyectos: List[ProyectoType]
    total_proyectos: int
    valoracion_promedio: float

"""
Tipos para KPIs de la plataforma.
"""
import strawberry
from typing import List


@strawberry.type
class UsuariosPorRol:
    """Usuarios agrupados por rol"""
    rol: str
    cantidad: int


@strawberry.type
class KPIsPlataforma:
    """KPIs generales de la plataforma"""
    total_usuarios: int
    usuarios_por_rol: List[UsuariosPorRol]
    total_proyectos: int
    total_arquitectos: int
    total_clientes: int
    total_incidencias: int
    arquitectos_verificados: int

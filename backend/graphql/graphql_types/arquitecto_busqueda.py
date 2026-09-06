"""
Tipo simplificado para búsqueda de arquitectos.
"""
import strawberry
from typing import List, Optional


@strawberry.type
class UsuarioSimple:
    """Usuario asociado al arquitecto (campos básicos)"""
    id: str
    nombre: str
    apellido: str
    email: str
    foto_perfil: Optional[str] = strawberry.field(name="fotoPerfil", default=None)


@strawberry.type
class ProyectoSimple:
    """Proyecto con información básica"""
    id: str
    titulo_proyecto: str = strawberry.field(name="tituloProyecto")
    valoracion_promedio: float = strawberry.field(name="valoracionPromedio")


@strawberry.type
class ArquitectoBusqueda:
    """Arquitecto con información para búsqueda (estructura plana)"""
    id: str
    cedula: str
    especialidades: str
    descripcion: Optional[str]
    valoracion_promedio_proyecto: float = strawberry.field(name="valoracionPromedioProyecto")
    verificado: bool
    usuario: UsuarioSimple
    proyectos: List[ProyectoSimple]

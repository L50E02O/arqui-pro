"""
Tipo para reporte de incidencias.
"""
import strawberry
from typing import List, Optional
from adapters.schemas.incidencia_schema import IncidenciaType
from adapters.schemas.usuario_schema import UsuarioType


@strawberry.type
class ReporteIncidencias:
    """Reporte completo de incidencias con información de usuarios involucrados"""
    incidencia: IncidenciaType
    emisor: Optional[UsuarioType]
    infractor: Optional[UsuarioType]
    moderador: Optional[UsuarioType]


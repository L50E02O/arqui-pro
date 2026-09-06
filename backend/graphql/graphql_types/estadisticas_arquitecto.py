"""
Tipos para estadísticas de arquitecto.
"""
import strawberry
from typing import List


@strawberry.type
class ProyectosPorTipo:
    """Agrupación de proyectos por tipo"""
    tipo: str
    cantidad: int


@strawberry.type
class EstadisticasArquitecto:
    """Estadísticas completas de un arquitecto"""
    arquitecto_id: strawberry.ID
    nombre_completo: str
    total_proyectos: int
    valoracion_promedio: float
    proyectos_por_tipo: List[ProyectosPorTipo]
    total_valoraciones: int
    verificado: bool

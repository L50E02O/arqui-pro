"""
Tipos para métricas de proyecto.
"""
import strawberry
from typing import Optional


@strawberry.type
class MetricasProyecto:
    """Métricas calculadas de un proyecto específico"""
    proyecto_id: strawberry.ID
    titulo: str
    total_avances: int
    total_valoraciones: int
    valoracion_promedio: float
    dias_transcurridos: Optional[int]
    estado: str

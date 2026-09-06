import strawberry
from typing import List


@strawberry.type
class EstadisticasGenerales:
    """Métricas generales del sistema"""
    total_usuarios: int
    total_arquitectos: int
    total_clientes: int
    total_moderadores: int
    total_proyectos: int
    total_conversaciones: int
    total_valoraciones: int


@strawberry.type
class EstadisticasArquitectos:
    """Estadísticas sobre arquitectos"""
    total: int
    verificados: int
    no_verificados: int
    promedio_valoracion: float
    con_proyectos: int
    sin_proyectos: int


@strawberry.type
class EstadisticasProyectos:
    """Estadísticas sobre proyectos"""
    total: int
    portafolio: int
    contratados: int
    promedio_valoracion: float
    total_avances: int
    total_valoraciones: int


@strawberry.type
class ProyectosPorTipo:
    """Conteo de proyectos agrupados por tipo"""
    tipo: str
    cantidad: int
    promedio_valoracion: float


@strawberry.type
class ArquitectoTop:
    """Top arquitectos por valoración"""
    id: strawberry.ID
    nombre: str
    apellido: str
    cedula: str
    promedio_valoracion: float
    total_proyectos: int
    verificado: bool


@strawberry.type
class ProyectoReciente:
    """Proyectos recientes"""
    id: strawberry.ID
    titulo: str
    tipo: str
    fecha_publicacion: str
    valoracion_promedio: float
    nombre_arquitecto: str


@strawberry.type
class DashboardMetricas:
    """Métricas completas para dashboard administrativo"""
    generales: EstadisticasGenerales
    arquitectos: EstadisticasArquitectos
    proyectos: EstadisticasProyectos
    top_arquitectos: List[ArquitectoTop]
    proyectos_recientes: List[ProyectoReciente]

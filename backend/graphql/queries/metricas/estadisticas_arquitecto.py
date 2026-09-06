"""
Query 4: Estadísticas de Arquitecto
Obtiene estadísticas completas de un arquitecto.
"""
import strawberry
from typing import Optional
from infrastructure.rest_client import rest_client
from graphql_types.estadisticas_arquitecto import EstadisticasArquitecto, ProyectosPorTipo


async def resolver_estadisticas_arquitecto(arquitecto_id: strawberry.ID) -> Optional[EstadisticasArquitecto]:
    """
    Obtiene estadísticas completas de un arquitecto:
    - Total de proyectos
    - Valoración promedio
    - Proyectos agrupados por tipo
    - Total de valoraciones recibidas
    - Estado de verificación
    """
    try:
        # Obtener arquitecto
        arq_data = await rest_client.get_arquitecto(str(arquitecto_id))
        usuario_data = arq_data.get("usuario", {})
        nombre_completo = f"{usuario_data.get('nombre')} {usuario_data.get('apellido')}"
        
        # Obtener proyectos
        proyectos_data = await rest_client.get_proyectos(params={"arquitecto_id": str(arquitecto_id)})
        proyectos = [p for p in proyectos_data if str(p.get("arquitecto_id")) == str(arquitecto_id)]
        
        # Agrupar por tipo
        tipos_dict = {}
        for p in proyectos:
            tipo = p.get("tipo_proyecto") or "Sin especificar"
            tipos_dict[tipo] = tipos_dict.get(tipo, 0) + 1
        
        proyectos_por_tipo = [
            ProyectosPorTipo(tipo=tipo, cantidad=cant)
            for tipo, cant in tipos_dict.items()
        ]
        
        # Obtener todas las valoraciones de estos proyectos
        total_valoraciones = 0
        suma_valoraciones = 0.0
        for p in proyectos:
            val_data = await rest_client.get_valoraciones(params={"proyecto_id": str(p.get("id"))})
            valoraciones = [v for v in val_data if str(v.get("proyecto_id")) == str(p.get("id"))]
            total_valoraciones += len(valoraciones)
            suma_valoraciones += sum(v.get("calificacion", 0.0) for v in valoraciones)
        
        valoracion_prom = suma_valoraciones / total_valoraciones if total_valoraciones > 0 else 0.0
        
        return EstadisticasArquitecto(
            arquitecto_id=str(arquitecto_id),
            nombre_completo=nombre_completo,
            total_proyectos=len(proyectos),
            valoracion_promedio=valoracion_prom,
            proyectos_por_tipo=proyectos_por_tipo,
            total_valoraciones=total_valoraciones,
            verificado=arq_data.get("verificado") or False
        )
    except Exception as e:
        print(f"[ERROR]  Error en estadisticasArquitecto: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

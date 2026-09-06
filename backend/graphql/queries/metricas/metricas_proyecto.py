"""
Query 6: Métricas de Proyecto
Obtiene métricas calculadas de un proyecto específico.
"""
import strawberry
from typing import Optional
from datetime import date, datetime
from infrastructure.rest_client import rest_client
from graphql_types.metricas_proyecto import MetricasProyecto


async def resolver_metricas_proyecto(proyecto_id: strawberry.ID) -> Optional[MetricasProyecto]:
    """
    Obtiene métricas calculadas de un proyecto específico:
    - Total de avances
    - Total de valoraciones
    - Valoración promedio calculada
    - Días transcurridos desde publicación
    - Estado del proyecto
    """
    try:
        # Obtener proyecto
        proy_data = await rest_client.get_proyecto(str(proyecto_id))
        
        # Obtener avances
        avances_data = await rest_client.get_avances(params={"proyecto_id": str(proyecto_id)})
        avances = [a for a in avances_data if str(a.get("proyecto_id")) == str(proyecto_id)]
        
        # Obtener valoraciones
        val_data = await rest_client.get_valoraciones(params={"proyecto_id": str(proyecto_id)})
        valoraciones = [v for v in val_data if str(v.get("proyecto_id")) == str(proyecto_id)]
        
        # Calcular valoración promedio
        if valoraciones:
            val_prom = sum(v.get("calificacion", 0.0) for v in valoraciones) / len(valoraciones)
        else:
            val_prom = 0.0
        
        # Calcular días transcurridos
        dias_transcurridos = None
        if proy_data.get("fecha_publicacion"):
            try:
                fecha_pub = proy_data.get("fecha_publicacion")
                if isinstance(fecha_pub, str):
                    fecha_pub = datetime.strptime(fecha_pub.split("T")[0], "%Y-%m-%d").date()
                hoy = date.today()
                dias_transcurridos = (hoy - fecha_pub).days
            except:
                pass
        
        return MetricasProyecto(
            proyecto_id=str(proyecto_id),
            titulo=proy_data.get("titulo_proyecto") or "Sin título",
            total_avances=len(avances),
            total_valoraciones=len(valoraciones),
            valoracion_promedio=val_prom,
            dias_transcurridos=dias_transcurridos,
            estado=proy_data.get("tipo_proyecto") or "activo"
        )
    except Exception as e:
        print(f"[ERROR]  Error en metricasProyecto: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

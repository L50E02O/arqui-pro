"""
Query 1: Perfil Completo de Arquitecto
Obtiene el perfil completo de un arquitecto con usuario, proyectos y estadísticas.
"""
import strawberry
from typing import Optional
from infrastructure.rest_client import rest_client
from graphql_types.perfil_completo_arquitecto import PerfilCompletoArquitecto
from adapters.schemas.arquitecto_schema import ArquitectoType
from adapters.schemas.usuario_schema import UsuarioType
from adapters.schemas.proyecto_schema import ProyectoType


async def resolver_perfil_completo_arquitecto(arquitecto_id: strawberry.ID) -> Optional[PerfilCompletoArquitecto]:
    """
    Obtiene el perfil completo de un arquitecto incluyendo:
    - Datos básicos del arquitecto
    - Información del usuario asociado
    - Lista completa de proyectos
    - Total de proyectos y valoración promedio
    """
    try:
        # Obtener arquitecto
        arq_data = await rest_client.get_arquitecto(str(arquitecto_id))
        
        # El serializer de Rails incluye el usuario completo
        usuario_data = arq_data.get("usuario", {})
        
        arquitecto = ArquitectoType(
            id=arq_data.get("id"),
            cedula=arq_data.get("cedula"),
            valoracion_prom_proyecto=arq_data.get("valoracion_prom_proyecto") or 0.0,
            descripcion=arq_data.get("descripcion") or "",
            especialidades=arq_data.get("especialidades") or "",
            ubicacion=arq_data.get("ubicacion") or "",
            verificado=arq_data.get("verificado") or False,
            vistas_perfil=arq_data.get("vistas_perfil") or 0,
            usuario_id=usuario_data.get("id"),
        )
        
        # Usar el usuario que ya viene en la respuesta del arquitecto
        usuario = UsuarioType(
            id=usuario_data.get("id"),
            nombre=usuario_data.get("nombre"),
            apellido=usuario_data.get("apellido"),
            email=usuario_data.get("email"),
            estado_cuenta=usuario_data.get("estado_cuenta"),
            rol=usuario_data.get("rol"),
            fecha_registro=usuario_data.get("fecha_registro"),
            foto_perfil=usuario_data.get("foto_perfil"),
        )
        
        # Obtener proyectos del arquitecto
        # Obtener proyectos del arquitecto
        proyectos_data = await rest_client.get_proyectos(params={"arquitecto_id": str(arquitecto_id)})
        proyectos = [
            ProyectoType(
                id=p.get("id"),
                titulo_proyecto=p.get("titulo_proyecto"),
                valoracion_promedio=p.get("valoracion_promedio") or 0.0,
                descripcion=p.get("descripcion") or "",
                tipo_proyecto=p.get("tipo_proyecto") or "",
                fecha_publicacion=p.get("fecha_publicacion"),
                arquitecto_id=p.get("arquitecto_id"),
                conversacion_id=p.get("conversacion_id"),
                cliente_id=p.get("cliente_id"),
                solicitud_proyecto_id=p.get("solicitud_proyecto_id"),
            )
            for p in proyectos_data
            if str(p.get("arquitecto_id")) == str(arquitecto_id)
        ]
        
        # Calcular valoración promedio
        if proyectos:
            valoracion_prom = sum(p.valoracion_promedio for p in proyectos) / len(proyectos)
        else:
            valoracion_prom = 0.0
        
        return PerfilCompletoArquitecto(
            arquitecto=arquitecto,
            usuario=usuario,
            proyectos=proyectos,
            total_proyectos=len(proyectos),
            valoracion_promedio=valoracion_prom
        )
    except Exception as e:
        print(f"[ERROR]  Error en perfilCompletoArquitecto: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

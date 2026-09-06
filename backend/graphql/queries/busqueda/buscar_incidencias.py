"""
Query: Buscar Incidencias
Búsqueda de incidencias con filtros opcionales.
"""
import strawberry
from typing import Optional, List
from infrastructure.rest_client import rest_client
from graphql_types.reporte_incidencias import ReporteIncidencias
from adapters.schemas.incidencia_schema import IncidenciaType
from adapters.schemas.usuario_schema import UsuarioType


async def resolver_buscar_incidencias(
    estado: Optional[str] = None,
    limite: Optional[int] = None
) -> List[ReporteIncidencias]:
    """
    Búsqueda de incidencias:
    - Filtro por estado (opcional)
    - Límite de resultados (opcional)
    Retorna lista de incidencias con información de usuarios involucrados
    """
    try:
        # Obtener todas las incidencias
        params = {}
        if estado:
            params["estado"] = estado
        
        incidencias_response = await rest_client.get_incidencias(params=params)
        # El API REST devuelve un objeto con la clave "incidencias"
        if isinstance(incidencias_response, dict):
            incidencias_data = incidencias_response.get("incidencias", [])
        elif isinstance(incidencias_response, list):
            incidencias_data = incidencias_response
        else:
            incidencias_data = []
        
        resultados = []
        
        # Aplicar límite si se especifica
        if limite and limite > 0 and isinstance(incidencias_data, list):
            incidencias_data = incidencias_data[:limite]
        
        for inc in incidencias_data:
            # Construir incidencia
            fecha_incidencia = inc.get("fecha") or inc.get("fecha_creacion") or ""
            if isinstance(fecha_incidencia, str):
                fecha_str = fecha_incidencia
            else:
                fecha_str = str(fecha_incidencia) if fecha_incidencia else ""
            
            incidencia = IncidenciaType(
                id=inc.get("id"),
                descripcion=inc.get("descripcion") or "",
                estado=inc.get("estado") or "pendiente",
                fecha=fecha_str,
                usuario_emisor_id=str(inc.get("usuario_emisor_id") or inc.get("emisor_id") or ""),
                usuario_infractor_id=str(inc.get("usuario_infractor_id") or inc.get("infractor_id") or ""),
                moderador_id=str(inc.get("moderador_id")) if inc.get("moderador_id") else None,
            )
            
            # Obtener datos del emisor (optimizado: usar datos que ya vienen del API REST)
            emisor = None
            emisor_data = inc.get("emisor")
            if emisor_data:
                try:
                    emisor = UsuarioType(
                        id=emisor_data.get("id"),
                        nombre=emisor_data.get("nombre") or "",
                        apellido=emisor_data.get("apellido") or "",
                        email=emisor_data.get("email") or "",
                        estado_cuenta=emisor_data.get("estado_cuenta") or "activo",
                        rol="cliente",  # Por defecto
                        fecha_registro=None,
                        foto_perfil=None,
                    )
                except Exception as e:
                    print(f"[WARN]  Error al procesar emisor: {e}")
            
            # Obtener datos del infractor (optimizado: usar datos que ya vienen del API REST)
            infractor = None
            infractor_data = inc.get("infractor")
            if infractor_data:
                try:
                    infractor = UsuarioType(
                        id=infractor_data.get("id"),
                        nombre=infractor_data.get("nombre") or "",
                        apellido=infractor_data.get("apellido") or "",
                        email=infractor_data.get("email") or "",
                        estado_cuenta=infractor_data.get("estado_cuenta") or "activo",
                        rol="cliente",  # Por defecto
                        fecha_registro=None,
                        foto_perfil=None,
                    )
                except Exception as e:
                    print(f"[WARN]  Error al procesar infractor: {e}")
            
            # Obtener datos del moderador (si está disponible en la respuesta)
            moderador = None
            moderador_data = inc.get("moderador")
            if moderador_data and moderador_data.get("usuario"):
                try:
                    mod_usuario = moderador_data.get("usuario", {})
                    moderador = UsuarioType(
                        id=str(inc.get("moderador_id")) if inc.get("moderador_id") else "",
                        nombre=mod_usuario.get("nombre") or "",
                        apellido=mod_usuario.get("apellido") or "",
                        email="",  # No viene en la respuesta
                        estado_cuenta="activo",
                        rol="moderador",
                        fecha_registro=None,
                        foto_perfil=None,
                    )
                except Exception as e:
                    print(f"[WARN]  Error al procesar moderador: {e}")
            
            # Construir reporte
            reporte = ReporteIncidencias(
                incidencia=incidencia,
                emisor=emisor,
                infractor=infractor,
                moderador=moderador
            )
            resultados.append(reporte)
        
        return resultados
    except Exception as e:
        print(f"[ERROR]  Error en buscarIncidencias: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


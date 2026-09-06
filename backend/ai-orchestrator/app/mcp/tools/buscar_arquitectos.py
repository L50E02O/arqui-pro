"""
Tool 1: Buscar Arquitectos
Consulta arquitectos REALES desde el API REST con filtros
"""

from typing import Dict, Any, List, Optional
import httpx
from loguru import logger

from .base import MCPTool
from app.config import settings


class BuscarArquitectosTool(MCPTool):
    """
    Tool para buscar arquitectos REALES con filtros avanzados.
    Consulta el endpoint GET /api/v1/arquitectos
    """
    
    def get_name(self) -> str:
        return "buscar_arquitectos"
    
    def get_description(self) -> str:
        return "Busca arquitectos REALES de la base de datos por ubicación, especialidad o nombre."
    
    def get_parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "ubicacion": {
                    "type": "string",
                    "description": "Ciudad donde buscar arquitectos"
                },
                "especialidad": {
                    "type": "string",
                    "description": "Especialidad del arquitecto (ej: moderno, minimalista)"
                },
                "nombre": {
                    "type": "string",
                    "description": "Nombre del arquitecto a buscar"
                }
            },
            "required": []
        }
    
    def get_required_permissions(self) -> List[str]:
        return ["cliente", "moderador", "arquitecto"]  # Todos pueden buscar
    
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """
        Busca arquitectos REALES en la BD.
        Consulta tabla: arquitectos JOIN usuarios
        Campos: nombre, apellido, especialidades, ubicacion, valoracion_prom_proyecto, verificado
        
        Args:
            ubicacion: str (opcional - ciudad donde buscar)
            especialidad: str (opcional - especialidad)
            nombre: str (opcional - nombre del arquitecto)
            
        Returns:
            Lista de arquitectos REALES encontrados
        """
        ubicacion = kwargs.get("ubicacion", "")
        especialidad = kwargs.get("especialidad", "")
        nombre = kwargs.get("nombre", "")
        
        try:
            # Llamar a Rails API GET /api/v1/arquitectos
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.RAILS_API_URL}/arquitectos",
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    arquitectos = response.json()
                    
                    # Filtrar localmente si hay parámetros
                    resultados_filtrados = []
                    for arq in arquitectos:
                        # Obtener datos del usuario asociado
                        usuario = arq.get("usuario", {}) or {}
                        nombre_completo = f"{usuario.get('nombre', '')} {usuario.get('apellido', '')}".strip()
                        ubicacion_arq = arq.get("ubicacion", "") or ""
                        especialidades_arq = arq.get("especialidades", "") or ""
                        
                        # Aplicar filtros
                        match_ubicacion = not ubicacion or ubicacion.lower() in ubicacion_arq.lower()
                        match_especialidad = not especialidad or especialidad.lower() in especialidades_arq.lower()
                        match_nombre = not nombre or nombre.lower() in nombre_completo.lower()
                        
                        if match_ubicacion and match_especialidad and match_nombre:
                            resultados_filtrados.append({
                                "id": arq.get("id"),
                                "nombre": nombre_completo or "Sin nombre",
                                "especialidades": especialidades_arq or "General",
                                "ubicacion": ubicacion_arq or "No especificada",
                                "rating": arq.get("valoracion_prom_proyecto", 0) or 0,
                                "verificado": arq.get("verificado", False),
                                "descripcion": arq.get("descripcion", ""),
                                # El endpoint devuelve {"usuario": {"id": "..."}} en lugar de {"usuario_id": "..."}
                                "usuario_id": arq.get("usuario_id") or (arq.get("usuario") or {}).get("id")
                            })
                    
                    # Limitar resultados
                    resultados_filtrados = resultados_filtrados[:10]
                    
                    logger.info(f"[SUCCESS]  Encontrados {len(resultados_filtrados)} arquitectos REALES en BD")
                    
                    filtros_aplicados = []
                    if ubicacion:
                        filtros_aplicados.append(f"ubicación: {ubicacion}")
                    if especialidad:
                        filtros_aplicados.append(f"especialidad: {especialidad}")
                    if nombre:
                        filtros_aplicados.append(f"nombre: {nombre}")
                    
                    mensaje = f"Encontrados {len(resultados_filtrados)} arquitectos"
                    if filtros_aplicados:
                        mensaje += f" (filtros: {', '.join(filtros_aplicados)})"
                    
                    return {
                        "arquitectos": resultados_filtrados,
                        "total": len(resultados_filtrados),
                        "mensaje": mensaje,
                        "datos_reales": True,
                        "fuente": "base_de_datos"
                    }
                else:
                    logger.error(f"[ERROR]  Error de Rails API: {response.status_code}")
                    return {
                        "arquitectos": [],
                        "total": 0,
                        "error": f"Error del servidor Rails: {response.status_code}",
                        "datos_reales": False,
                        "sugerencia": "Asegúrate de que Rails esté corriendo en http://localhost:3000"
                    }
                    
        except httpx.ConnectError as e:
            logger.error(f"[ERROR]  No se puede conectar a Rails API: {e}")
            return {
                "arquitectos": [],
                "total": 0,
                "error": "No se puede conectar al servidor Rails",
                "datos_reales": False,
                "sugerencia": "Ejecuta 'rails server' en backend/APIREST"
            }
            
        except Exception as e:
            logger.error(f"Error buscando arquitectos: {e}")
            return {
                "arquitectos": [],
                "total": 0,
                "error": f"Error inesperado: {str(e)}",
                "datos_reales": False
            }

"""
Tool 2: Obtener Proyecto
Consulta detalles completos de un proyecto REAL específico
"""

from typing import Dict, Any, List
import httpx
from loguru import logger

from .base import MCPTool
from app.config import settings


class ObtenerProyectoTool(MCPTool):
    """
    Tool para obtener información detallada de un proyecto REAL.
    Incluye avances, incidencias, valoraciones, etc.
    """
    
    def get_name(self) -> str:
        return "obtener_proyecto"
    
    def get_description(self) -> str:
        return "Obtiene información REAL de un proyecto por su ID."
    
    def get_parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "proyecto_id": {
                    "type": "string",
                    "description": "ID único del proyecto (UUID o número)"
                }
            },
            "required": ["proyecto_id"]
        }
    
    def get_required_permissions(self) -> List[str]:
        return ["cliente", "arquitecto", "moderador"]
    
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """
        Obtiene el proyecto REAL con todos sus detalles.
        
        Args:
            proyecto_id: str (UUID o ID numérico)
            
        Returns:
            {
                "proyecto": {...},
                "avances": [...],
                "datos_reales": bool
            }
        """
        proyecto_id = kwargs.get("proyecto_id")
        
        if not proyecto_id:
            raise ValueError("proyecto_id es requerido")
        
        try:
            async with httpx.AsyncClient() as client:
                # Obtener proyecto
                response = await client.get(
                    f"{settings.RAILS_API_URL}/proyectos/{proyecto_id}",
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    proyecto = response.json()
                    logger.info(f"[SUCCESS]  Proyecto REAL obtenido: {proyecto_id}")
                    
                    # Intentar obtener avances del proyecto
                    avances = []
                    try:
                        avances_response = await client.get(
                            f"{settings.RAILS_API_URL}/avances",
                            params={"proyecto_id": proyecto_id},
                            timeout=10.0
                        )
                        if avances_response.status_code == 200:
                            avances = avances_response.json()
                    except:
                        pass
                    
                    return {
                        "proyecto": proyecto,
                        "avances": avances,
                        "datos_reales": True,
                        "mensaje": f"Proyecto encontrado: {proyecto.get('titulo_proyecto', 'Sin título')}"
                    }
                    
                elif response.status_code == 404:
                    logger.warning(f"[WARN]  Proyecto {proyecto_id} no encontrado")
                    return {
                        "proyecto": None,
                        "error": f"Proyecto {proyecto_id} no encontrado en la base de datos",
                        "datos_reales": True,
                        "sugerencia": "Verifica el ID del proyecto"
                    }
                else:
                    logger.error(f"[ERROR]  Error obteniendo proyecto: {response.status_code}")
                    return {
                        "proyecto": None,
                        "error": f"Error del servidor: {response.status_code}",
                        "datos_reales": False
                    }
            
        except httpx.ConnectError as e:
            logger.error(f"[ERROR]  No se puede conectar a Rails API: {e}")
            return {
                "proyecto": None,
                "error": "No se puede conectar al servidor Rails",
                "datos_reales": False,
                "sugerencia": "Ejecuta 'rails server' en backend/APIREST"
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo proyecto: {e}")
            return {
                "proyecto": None,
                "error": str(e),
                "datos_reales": False
            }

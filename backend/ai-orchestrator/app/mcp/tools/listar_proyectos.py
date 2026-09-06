"""
Tool 6: Listar Proyectos
Consulta proyectos REALES con filtros
"""

from typing import Dict, Any, List
import httpx
from loguru import logger

from .base import MCPTool
from app.config import settings


class ListarProyectosTool(MCPTool):
    """
    Tool para listar proyectos REALES con filtros.
    Consulta el endpoint GET /api/v1/proyectos
    """
    
    def get_name(self) -> str:
        return "listar_proyectos"
    
    def get_description(self) -> str:
        return "Lista todos los proyectos REALES de la base de datos con filtros opcionales."
    
    def get_parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "arquitecto_id": {
                    "type": "string",
                    "description": "Filtrar por ID del arquitecto"
                },
                "cliente_id": {
                    "type": "string",
                    "description": "Filtrar por ID del cliente"
                },
                "tipo_proyecto": {
                    "type": "string",
                    "description": "Filtrar por tipo de proyecto"
                },
                "estado": {
                    "type": "string",
                    "description": "Filtrar por estado (pendiente, en_progreso, completado)"
                }
            },
            "required": []
        }
    
    def get_required_permissions(self) -> List[str]:
        return ["cliente", "arquitecto", "moderador"]
    
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """
        Lista proyectos REALES con filtros.
        
        Args:
            arquitecto_id: str (opcional)
            cliente_id: str (opcional)
            tipo_proyecto: str (opcional)
            estado: str (opcional)
            
        Returns:
            Lista de proyectos REALES
        """
        arquitecto_id = kwargs.get("arquitecto_id")
        cliente_id = kwargs.get("cliente_id")
        tipo_proyecto = kwargs.get("tipo_proyecto")
        estado = kwargs.get("estado")
        
        try:
            params = {}
            if arquitecto_id:
                params["arquitecto_id"] = arquitecto_id
            if cliente_id:
                params["cliente_id"] = cliente_id
            if tipo_proyecto:
                params["tipo_proyecto"] = tipo_proyecto
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.RAILS_API_URL}/proyectos",
                    params=params,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    proyectos = response.json()
                    
                    # Filtrar por estado si se especificó
                    if estado:
                        proyectos = [p for p in proyectos if p.get("estado") == estado]
                    
                    # Formatear resultados
                    resultados = []
                    for p in proyectos[:20]:  # Máximo 20 resultados
                        resultados.append({
                            "id": p.get("id"),
                            "titulo": p.get("titulo_proyecto", "Sin título"),
                            "descripcion": p.get("descripcion", ""),
                            "estado": p.get("estado", "pendiente"),
                            "tipo_proyecto": p.get("tipo_proyecto", ""),
                            "arquitecto_id": p.get("arquitecto_id"),
                            "cliente_id": p.get("cliente_id"),
                            "fecha_inicio": p.get("fecha_inicio"),
                            "fecha_fin": p.get("fecha_fin")
                        })
                    
                    logger.info(f"[SUCCESS]  Encontrados {len(resultados)} proyectos REALES")
                    
                    filtros_aplicados = []
                    if arquitecto_id:
                        filtros_aplicados.append(f"arquitecto: {arquitecto_id}")
                    if cliente_id:
                        filtros_aplicados.append(f"cliente: {cliente_id}")
                    if estado:
                        filtros_aplicados.append(f"estado: {estado}")
                    
                    mensaje = f"Encontrados {len(resultados)} proyectos"
                    if filtros_aplicados:
                        mensaje += f" (filtros: {', '.join(filtros_aplicados)})"
                    
                    return {
                        "proyectos": resultados,
                        "total": len(resultados),
                        "mensaje": mensaje,
                        "datos_reales": True
                    }
                else:
                    logger.error(f"[ERROR]  Error de Rails API: {response.status_code}")
                    return {
                        "proyectos": [],
                        "total": 0,
                        "error": f"Error del servidor: {response.status_code}",
                        "datos_reales": False
                    }
                    
        except httpx.ConnectError as e:
            logger.error(f"[ERROR]  No se puede conectar a Rails API: {e}")
            return {
                "proyectos": [],
                "total": 0,
                "error": "No se puede conectar al servidor Rails",
                "datos_reales": False,
                "sugerencia": "Ejecuta 'rails server' en backend/APIREST"
            }
            
        except Exception as e:
            logger.error(f"Error listando proyectos: {e}")
            return {
                "proyectos": [],
                "total": 0,
                "error": str(e),
                "datos_reales": False
            }

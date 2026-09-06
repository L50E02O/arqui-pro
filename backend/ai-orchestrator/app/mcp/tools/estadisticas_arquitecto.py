"""
Tool 5: Estadísticas de Arquitecto
Reporte con métricas y KPIs REALES de un arquitecto
"""

from typing import Dict, Any, List
import httpx
from loguru import logger

from .base import MCPTool
from app.config import settings


class EstadisticasArquitectoTool(MCPTool):
    """
    Tool para obtener estadísticas y métricas REALES de un arquitecto.
    Consulta directamente la base de datos.
    """
    
    def get_name(self) -> str:
        return "estadisticas_arquitecto"
    
    def get_description(self) -> str:
        return (
            "Obtiene estadísticas REALES y KPIs de un arquitecto: "
            "proyectos completados, rating promedio, proyectos activos."
        )
    
    def get_parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "arquitecto_id": {
                    "type": "string",
                    "description": "ID del arquitecto o user_id (UUID)"
                }
            },
            "required": []
        }
    
    def get_required_permissions(self) -> List[str]:
        return ["arquitecto", "moderador", "cliente"]
    
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """
        Obtiene las estadísticas REALES del arquitecto.
        """
        arquitecto_id = kwargs.get("arquitecto_id")
        context = kwargs.get("context", {}) or {}
        
        # Si no hay arquitecto_id, usar el user_id del contexto
        if not arquitecto_id:
            arquitecto_id = context.get("user_id")
        
        if not arquitecto_id:
            return {"error": "arquitecto_id es requerido", "success": False}
        
        logger.info(f"[METRICS]  Buscando estadísticas para: {arquitecto_id}")
        
        try:
            # Paso 1: Obtener lista de arquitectos
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(f"{settings.RAILS_API_URL}/arquitectos")
                
                if response.status_code != 200:
                    return {
                        "error": f"Error obteniendo arquitectos: {response.status_code}",
                        "success": False
                    }
                
                arquitectos = response.json()
                logger.info(f"[LIST]  Obtenidos {len(arquitectos)} arquitectos")
            
            # Paso 2: Buscar el arquitecto por usuario_id o id
            arquitecto = None
            arquitecto_real_id = None
            
            logger.info(f"[SEARCH]  Buscando arquitecto con usuario_id o id = {arquitecto_id}")
            
            # Mostrar primeros usuario_ids para debug
            sample_usuario_ids = [str(a.get("usuario_id")) for a in arquitectos[:5]]
            logger.info(f"   Ejemplo usuario_ids en BD: {sample_usuario_ids}")
            
            for arq in arquitectos:
                arq_usuario_id = str(arq.get("usuario_id", ""))
                arq_id = str(arq.get("id", ""))
                
                # También comparar con el usuario anidado si existe
                usuario = arq.get("usuario") or {}
                usuario_id_from_nested = str(usuario.get("id", ""))
                
                if (arq_usuario_id == str(arquitecto_id) or 
                    arq_id == str(arquitecto_id) or
                    usuario_id_from_nested == str(arquitecto_id)):
                    arquitecto = arq
                    arquitecto_real_id = arq.get("id")
                    logger.info(f"[SUCCESS]  Arquitecto encontrado: id={arquitecto_real_id}, usuario_id={arq_usuario_id}")
                    break
            
            if not arquitecto:
                logger.warning(f"[ERROR]  No encontrado. Buscado: {arquitecto_id}")
                logger.warning(f"   Arquitectos disponibles (primeros 5): {[(a.get('id'), a.get('usuario_id')) for a in arquitectos[:5]]}")
                return {
                    "error": f"No se encontró tu perfil de arquitecto. Puede que tu cuenta de usuario (ID: {arquitecto_id}) no tenga un perfil de arquitecto asociado.",
                    "success": False,
                    "datos_reales": True,
                    "sugerencia": "Verifica que tu cuenta esté registrada como arquitecto en la plataforma."
                }
            
            # Paso 3: Obtener proyectos del arquitecto
            proyectos = []
            async with httpx.AsyncClient(timeout=15.0) as client:
                try:
                    response = await client.get(f"{settings.RAILS_API_URL}/proyectos")
                    if response.status_code == 200:
                        all_proyectos = response.json()
                        # Filtrar por arquitecto_id
                        proyectos = [p for p in all_proyectos if str(p.get("arquitecto_id")) == str(arquitecto_real_id)]
                        logger.info(f" Proyectos encontrados: {len(proyectos)}")
                except Exception as e:
                    logger.warning(f"Error obteniendo proyectos: {e}")
            
            # Paso 4: Calcular KPIs
            total = len(proyectos)
            completados = len([p for p in proyectos if p.get("estado") == "completado"])
            en_progreso = len([p for p in proyectos if p.get("estado") in ["en_progreso", "activo"]])
            pendientes = len([p for p in proyectos if p.get("estado") == "pendiente"])
            
            # Rating
            rating = arquitecto.get("valoracion_prom_proyecto") or 0
            try:
                rating = float(rating)
            except:
                rating = 0.0
            
            # Nombre del arquitecto
            usuario = arquitecto.get("usuario") or {}
            nombre = f"{usuario.get('nombre', '')} {usuario.get('apellido', '')}".strip()
            if not nombre:
                nombre = "Arquitecto"
            
            # Paso 5: Contar avances
            avances_count = 0
            async with httpx.AsyncClient(timeout=15.0) as client:
                try:
                    response = await client.get(f"{settings.RAILS_API_URL}/avances")
                    if response.status_code == 200:
                        all_avances = response.json()
                        proyecto_ids = [p.get("id") for p in proyectos]
                        avances_count = len([a for a in all_avances if a.get("proyecto_id") in proyecto_ids])
                except Exception as e:
                    logger.warning(f"Error contando avances: {e}")
            
            logger.info(f"[SUCCESS]  Estadísticas calculadas para {nombre}")
            
            return {
                "success": True,
                "datos_reales": True,
                "arquitecto_id": arquitecto_real_id,
                "usuario_id": arquitecto.get("usuario_id"),
                "arquitecto": {
                    "nombre": nombre,
                    "especialidades": arquitecto.get("especialidades", ""),
                    "ubicacion": arquitecto.get("ubicacion", ""),
                    "verificado": arquitecto.get("verificado", False),
                    "descripcion": arquitecto.get("descripcion", "")
                },
                "kpis": {
                    "total_proyectos": total,
                    "en_progreso": en_progreso,
                    "completados": completados,
                    "pendientes": pendientes,
                    "valoracion_promedio": round(rating, 1),
                    "avances_registrados": avances_count
                },
                "mensaje": f"Estadísticas de {nombre}: {total} proyectos, rating {rating}"
            }
                
        except httpx.ConnectError as e:
            logger.error(f"[ERROR]  No se puede conectar a Rails API: {e}")
            return {
                "error": "No se puede conectar al servidor Rails",
                "success": False,
                "sugerencia": "Ejecuta 'rails server' en backend/APIREST"
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas: {e}")
            import traceback
            traceback.print_exc()
            return {
                "error": str(e),
                "success": False
            }

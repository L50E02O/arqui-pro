"""
Tool: Crear Avance
Acción para crear un avance REAL de un proyecto en la base de datos
"""

from typing import Dict, Any, List
import httpx
from loguru import logger
from datetime import datetime

from .base import MCPTool
from app.config import settings


class CrearAvanceTool(MCPTool):
    """
    Tool para crear un avance REAL de un proyecto.
    Arquitectos reportan progreso de sus proyectos.
    """
    
    def get_name(self) -> str:
        return "crear_avance"
    
    def get_description(self) -> str:
        return "[SOLO ARQUITECTOS] Crear avance/progreso de proyecto."
    
    def get_parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "proyecto_id": {
                    "type": "string",
                    "description": "ID o nombre del proyecto al que pertenece el avance"
                },
                "descripcion": {
                    "type": "string",
                    "description": "Descripción del avance o progreso realizado"
                },
                "imagenes": {
                    "type": "array",
                    "description": "URLs de imágenes del avance (opcional)",
                    "items": {
                        "type": "string"
                    }
                }
            },
            "required": ["proyecto_id", "descripcion"]
        }
    
    def get_required_permissions(self) -> List[str]:
        return ["arquitecto", "moderador"]
    
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """
        Crea un avance REAL en la base de datos.
        
        Args:
            proyecto_id: str (ID o nombre del proyecto)
            descripcion: str (descripción del avance)
            imagenes: list[str] (URLs de imágenes, opcional)
            context: dict con user_id y user_role
            
        Returns:
            Confirmación de creación con detalles del avance
        """
        proyecto_id_input = kwargs.get("proyecto_id")
        descripcion = kwargs.get("descripcion")
        imagenes_urls = kwargs.get("imagenes", [])
        context = kwargs.get("context", {})
        user_id = context.get("user_id")
        user_role = context.get("user_role")
        
        logger.info(f"[NOTE]  Creando avance para proyecto={proyecto_id_input}, user_id={user_id}")
        
        if not user_id:
            return {
                "error": "No se pudo identificar al usuario.",
                "success": False
            }
        
        if not descripcion:
            return {
                "error": "Debes proporcionar una descripción del avance.",
                "success": False
            }
        
        try:
            # Paso 1: Buscar arquitecto_id real desde usuario_id
            arquitecto_id_real = None
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.RAILS_API_URL}/arquitectos",
                    timeout=10.0
                )
                if response.status_code == 200:
                    arquitectos = response.json()
                    for arq in arquitectos:
                        # El endpoint devuelve {"usuario": {"id": "..."}} en lugar de {"usuario_id": "..."}
                        arq_usuario_id = arq.get("usuario_id") or (arq.get("usuario") or {}).get("id")
                        if str(arq_usuario_id) == str(user_id):
                            arquitecto_id_real = arq.get("id")
                            logger.info(f"[SUCCESS]  Arquitecto encontrado: arquitecto_id={arquitecto_id_real}")
                            break
            
            if not arquitecto_id_real:
                return {
                    "error": "No se encontró un perfil de arquitecto asociado a tu usuario.",
                    "success": False
                }
            
            # Paso 2: Buscar proyecto_id real (por ID o por nombre del proyecto)
            proyecto_id_real = None
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.RAILS_API_URL}/proyectos",
                    timeout=10.0
                )
                if response.status_code == 200:
                    proyectos = response.json()
                    
                    # Primero intentar buscar por UUID exacto
                    for proj in proyectos:
                        if str(proj.get("id")) == str(proyecto_id_input):
                            proyecto_id_real = proj.get("id")
                            logger.info(f"[SUCCESS]  Proyecto encontrado por ID: {proyecto_id_real}")
                            break
                    
                    # Si no se encontró por ID, buscar por nombre
                    if not proyecto_id_real:
                        for proj in proyectos:
                            titulo = proj.get("titulo_proyecto", "").lower()
                            if proyecto_id_input.lower() in titulo:
                                # Verificar que el proyecto pertenece al arquitecto
                                if str(proj.get("arquitecto_id")) == str(arquitecto_id_real):
                                    proyecto_id_real = proj.get("id")
                                    logger.info(f"[SUCCESS]  Proyecto encontrado por nombre: {titulo} -> {proyecto_id_real}")
                                    break
            
            if not proyecto_id_real:
                return {
                    "error": f"No se encontró el proyecto '{proyecto_id_input}' asociado a tu cuenta.",
                    "success": False,
                    "sugerencia": "Verifica el nombre del proyecto o asegúrate de que te pertenece."
                }
            
            # Paso 3: Crear avance con ID real
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            fecha_actual = datetime.now().strftime("%Y-%m-%d")
            
            payload = {
                "avance": {
                    "descripcion": descripcion,
                    "fecha": fecha_actual,
                    "proyecto_id": proyecto_id_real
                }
            }
            
            # Agregar imágenes si se proporcionaron
            if imagenes_urls and isinstance(imagenes_urls, list):
                payload["imagenes"] = [{"url": url} for url in imagenes_urls if url]
            
            logger.info(f"[SEND]  POST {settings.RAILS_API_URL}/avances")
            logger.info(f"   Payload: {payload}")
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.RAILS_API_URL}/avances",
                    json=payload,
                    headers=headers,
                    timeout=15.0
                )
                
                logger.info(f" Respuesta Rails: status={response.status_code}")
                
                if response.status_code in [200, 201]:
                    data = response.json()
                    avance_id = data.get("id")
                    imagenes = data.get("imagenes", [])
                    logger.info(f"[SUCCESS]  AVANCE CREADO EN BD: ID={avance_id}, {len(imagenes)} imágenes")
                    
                    response_data = {
                        "mensaje": f"[SUCCESS]  ¡Avance creado exitosamente!",
                        "avance": {
                            "id": avance_id,
                            "descripcion": data.get("descripcion", descripcion),
                            "fecha": data.get("fecha", fecha_actual),
                            "proyecto_id": data.get("proyecto_id")
                        },
                        "success": True,
                        "creado_en_bd": True
                    }
                    
                    if imagenes:
                        response_data["avance"]["imagenes"] = imagenes
                        response_data["mensaje"] += f" (con {len(imagenes)} imagen{'es' if len(imagenes) > 1 else ''})"
                    
                    return response_data
                
                elif response.status_code == 422:
                    error_data = response.json()
                    logger.error(f"[ERROR]  Error de validación: {error_data}")
                    return {
                        "error": f"Error de validación: {error_data}",
                        "success": False,
                        "creado_en_bd": False
                    }
                else:
                    logger.error(f"[ERROR]  Error: {response.status_code} - {response.text}")
                    return {
                        "error": f"Error del servidor: {response.status_code}",
                        "success": False,
                        "creado_en_bd": False
                    }
                    
        except httpx.ConnectError as e:
            logger.error(f"[ERROR]  No se puede conectar a Rails API: {e}")
            return {
                "error": "[WARN]  El servidor Rails no está disponible.",
                "success": False,
                "creado_en_bd": False,
                "sugerencia": "Ejecuta: cd backend/APIREST && rails server"
            }
        
        except httpx.TimeoutException as e:
            logger.error(f"[ERROR]  Timeout: {e}")
            return {
                "error": "Timeout conectando al servidor.",
                "success": False,
                "creado_en_bd": False
            }
        
        except Exception as e:
            logger.error(f"[ERROR]  Error inesperado: {e}")
            return {
                "error": f"No se pudo crear el avance: {str(e)}",
                "success": False,
                "creado_en_bd": False
            }

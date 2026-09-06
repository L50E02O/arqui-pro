"""
Tool 8: Crear Proyecto
Acción para crear un proyecto REAL en la base de datos
"""

from typing import Dict, Any, List
import httpx
from loguru import logger
from datetime import datetime

from .base import MCPTool
from app.config import settings


class CrearProyectoTool(MCPTool):
    """
    Tool para crear un proyecto REAL en la base de datos.
    Solo arquitectos pueden crear proyectos.
    """
    
    def get_name(self) -> str:
        return "crear_proyecto"
    
    def get_description(self) -> str:
        return "[SOLO ARQUITECTOS] Crear proyecto. NO usar si el usuario es cliente."
    
    def get_parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "titulo_proyecto": {
                    "type": "string",
                    "description": "Título del proyecto"
                },
                "descripcion": {
                    "type": "string",
                    "description": "Descripción detallada del proyecto"
                },
                "cliente_id": {
                    "type": "string",
                    "description": "Nombre del cliente (ej: 'Carlos López', 'Marcos García') - opcional"
                },
                "tipo_proyecto": {
                    "type": "string",
                    "description": "Tipo de proyecto: portafolio (proyecto personal sin cliente) o contratado (proyecto con cliente)"
                }
            },
            "required": ["titulo_proyecto", "descripcion"]
        }
    
    def get_required_permissions(self) -> List[str]:
        return ["arquitecto", "moderador"]
    
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """
        Crea un proyecto REAL en la base de datos.
        
        Args:
            titulo_proyecto: str (título)
            descripcion: str (descripción)
            cliente_id: str (opcional)
            tipo_proyecto: str (portafolio o contratado)
            context: dict con user_id y user_role
            
        Returns:
            Confirmación de creación con detalles del proyecto
        """
        titulo = kwargs.get("titulo_proyecto", "Proyecto sin título")
        descripcion = kwargs.get("descripcion", "")
        cliente_id = kwargs.get("cliente_id")
        tipo_proyecto = kwargs.get("tipo_proyecto", "portafolio")
        context = kwargs.get("context", {})
        user_id = context.get("user_id")
        user_role = context.get("user_role")
        
        logger.info(f"[NOTE]  Creando proyecto REAL: '{titulo}' para user_id={user_id}")
        
        if not user_id:
            return {
                "error": "No se pudo identificar al usuario.",
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
                
                logger.info(f" GET /arquitectos status={response.status_code}")
                
                if response.status_code == 200:
                    arquitectos = response.json()
                    logger.info(f"[METRICS]  Total arquitectos en BD: {len(arquitectos)}")
                    
                    for arq in arquitectos:
                        # El endpoint devuelve {"usuario": {"id": "..."}} en lugar de {"usuario_id": "..."}
                        arq_usuario_id = arq.get("usuario_id") or (arq.get("usuario") or {}).get("id")
                        logger.debug(f"   Comparando: arq.usuario_id={arq_usuario_id} vs user_id={user_id}")
                        
                        if str(arq_usuario_id) == str(user_id):
                            arquitecto_id_real = arq.get("id")
                            logger.info(f"[SUCCESS]  Arquitecto encontrado: arquitecto_id={arquitecto_id_real} para usuario_id={user_id}")
                            break
                    
                    if not arquitecto_id_real:
                        logger.warning(f"[WARN]  No se encontró arquitecto con usuario_id={user_id}")
                        logger.warning(f"   IDs disponibles: {[str((a.get('usuario') or {}).get('id')) for a in arquitectos[:5]]}")
            
            if not arquitecto_id_real:
                return {
                    "error": "No se encontró un perfil de arquitecto asociado a tu usuario. Debes registrarte como arquitecto primero.",
                    "success": False,
                    "creado_en_bd": False,
                    "debug": {
                        "user_id_buscado": user_id,
                        "total_arquitectos": len(arquitectos) if 'arquitectos' in locals() else 0
                    }
                }
            
            # Paso 2: Si hay cliente_id (nombre), buscar su ID real
            cliente_id_real = None
            if cliente_id:
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        f"{settings.RAILS_API_URL}/clientes",
                        timeout=10.0
                    )
                    if response.status_code == 200:
                        clientes = response.json()
                        for c in clientes:
                            usuario = c.get("usuario") or {}
                            if not usuario:  # Skip clientes sin usuario
                                continue
                            nombre_completo = f"{usuario.get('nombre', '')} {usuario.get('apellido', '')}".strip().lower()
                            if cliente_id.lower() in nombre_completo:
                                cliente_id_real = c.get("id")
                                logger.info(f"[SUCCESS]  Cliente encontrado: {nombre_completo} -> cliente_id={cliente_id_real}")
                                break
            
            # Paso 3: Crear proyecto con IDs reales
            fecha_actual = datetime.now().strftime("%Y-%m-%d")
            payload = {
                "proyecto": {
                    "titulo_proyecto": titulo,
                    "descripcion": descripcion,
                    "arquitecto_id": arquitecto_id_real,
                    "tipo_proyecto": tipo_proyecto,
                    "fecha_publicacion": fecha_actual
                }
            }
            
            # Agregar cliente_id real si se encontró
            if cliente_id_real:
                payload["proyecto"]["cliente_id"] = cliente_id_real
            
            logger.info(f"[SEND]  POST {settings.RAILS_API_URL}/proyectos")
            logger.info(f"   Payload: {payload}")
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.RAILS_API_URL}/proyectos",
                    json=payload,
                    timeout=15.0
                )
                
                logger.info(f" Respuesta Rails: status={response.status_code}")
                
                if response.status_code in [200, 201]:
                    data = response.json()
                    proyecto_id = data.get("id")
                    logger.info(f"[SUCCESS]  PROYECTO CREADO EN BD: ID={proyecto_id}")
                    
                    return {
                        "mensaje": f"[SUCCESS]  ¡Proyecto '{titulo}' creado exitosamente en la base de datos!",
                        "proyecto": {
                            "id": proyecto_id,
                            "titulo": data.get("titulo_proyecto", titulo),
                            "descripcion": data.get("descripcion", descripcion),
                            "tipo_proyecto": data.get("tipo_proyecto", tipo_proyecto),
                            "arquitecto_id": data.get("arquitecto_id"),
                            "cliente_id": data.get("cliente_id"),
                            "fecha_publicacion": data.get("fecha_publicacion")
                        },
                        "success": True,
                        "creado_en_bd": True
                    }
                elif response.status_code == 422:
                    error_data = response.json()
                    logger.error(f"[ERROR]  Error de validación: {error_data}")
                    return {
                        "error": f"Error de validación: {error_data}",
                        "success": False,
                        "creado_en_bd": False
                    }
                elif response.status_code == 403:
                    return {
                        "error": "No autorizado. Solo arquitectos pueden crear proyectos.",
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
                "error": "[WARN]  El servidor Rails no está disponible",
                "success": False,
                "creado_en_bd": False,
                "sugerencia": "Ejecuta: cd backend/APIREST && rails server"
            }
            
        except Exception as e:
            logger.error(f"[ERROR]  Error inesperado: {e}")
            return {
                "error": f"No se pudo crear el proyecto: {str(e)}",
                "success": False,
                "creado_en_bd": False
            }

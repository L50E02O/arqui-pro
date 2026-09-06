"""
Tool 3: Crear Solicitud de Proyecto
Acción para crear una nueva solicitud de proyecto REAL en la base de datos
"""

from typing import Dict, Any, List
import httpx
from loguru import logger
from datetime import datetime

from .base import MCPTool
from app.config import settings


class CrearSolicitudTool(MCPTool):
    """
    Tool para crear una solicitud de proyecto REAL.
    El cliente solicita un proyecto a un arquitecto.
    """
    
    def get_name(self) -> str:
        return "crear_solicitud"
    
    def get_description(self) -> str:
        return "[SOLO CLIENTES] Crear solicitud a arquitecto. NO usar si el usuario es arquitecto."
    
    def get_parameters(self) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "descripcion": {
                    "type": "string",
                    "description": "Descripción del proyecto que deseas solicitar"
                },
                "arquitecto_id": {
                    "type": "string",
                    "description": "Nombre del arquitecto al que deseas solicitar (ej: 'Juan Pérez', 'María García')"
                }
            },
            "required": ["descripcion"]
        }
    
    def get_required_permissions(self) -> List[str]:
        return ["cliente", "moderador"]
    
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """
        Crea una solicitud de proyecto REAL en la base de datos.
        
        Args:
            descripcion: str (descripción del proyecto)
            arquitecto_id: str (opcional - ID del arquitecto)
            context: dict con user_id, user_role
            
        Returns:
            Confirmación de creación con detalles del proyecto
        """
        descripcion = kwargs.get("descripcion", "Proyecto sin nombre")
        arquitecto_id = kwargs.get("arquitecto_id")
        context = kwargs.get("context", {})
        user_id = context.get("user_id")
        user_role = context.get("user_role", "cliente")
        
        logger.info(f"[NOTE]  Creando solicitud REAL para user_id={user_id}, descripcion='{descripcion}'")
        
        if not user_id:
            return {
                "error": "No se pudo identificar al usuario.",
                "success": False
            }
        
        try:
            # Paso 1: Buscar cliente_id real desde usuario_id
            cliente_id_real = None
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.RAILS_API_URL}/clientes",
                    timeout=10.0
                )
                if response.status_code == 200:
                    clientes = response.json()
                    for c in clientes:
                        if str(c.get("usuario_id")) == str(user_id):
                            cliente_id_real = c.get("id")
                            logger.info(f"[SUCCESS]  Cliente encontrado: cliente_id={cliente_id_real} para usuario_id={user_id}")
                            break
            
            if not cliente_id_real:
                return {
                    "error": "No se encontró un perfil de cliente asociado a tu usuario. Debes registrarte como cliente primero.",
                    "success": False,
                    "creado_en_bd": False
                }
            
            # Paso 2: Si hay arquitecto_id (nombre), buscar su ID real
            arquitecto_id_real = None
            if arquitecto_id:
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        f"{settings.RAILS_API_URL}/arquitectos",
                        timeout=10.0
                    )
                    if response.status_code == 200:
                        arquitectos = response.json()
                        for arq in arquitectos:
                            # Buscar por nombre completo del usuario
                            usuario = arq.get("usuario", {})
                            nombre_completo = f"{usuario.get('nombre', '')} {usuario.get('apellido', '')}".strip().lower()
                            if arquitecto_id.lower() in nombre_completo:
                                arquitecto_id_real = arq.get("id")
                                logger.info(f"[SUCCESS]  Arquitecto encontrado: {nombre_completo} -> arquitecto_id={arquitecto_id_real}")
                                break
            
            # Paso 3: Crear solicitud con IDs reales
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                fecha_actual = datetime.now().strftime("%Y-%m-%d")
                
                payload = {
                    "solicitud_proyecto": {
                        "estado": "pendiente",
                        "fecha": fecha_actual,
                        "cliente_id": cliente_id_real
                    }
                }
                
                if arquitecto_id_real:
                    payload["solicitud_proyecto"]["arquitecto_id"] = arquitecto_id_real
                
                logger.info(f"[SEND]  POST {settings.RAILS_API_URL}/solicitudes_proyecto")
                logger.info(f"   Payload: {payload}")
                
                response = await client.post(
                    f"{settings.RAILS_API_URL}/solicitudes_proyecto",
                    json=payload,
                    headers=headers,
                    timeout=15.0
                )
                
                logger.info(f" Respuesta Rails: status={response.status_code}")
                
                if response.status_code in [200, 201]:
                    data = response.json()
                    solicitud_id = data.get("id")
                    logger.info(f"[SUCCESS]  SOLICITUD CREADA EN BD: ID={solicitud_id}")
                    
                    return {
                        "mensaje": f"[SUCCESS]  ¡Solicitud creada exitosamente en la base de datos!",
                        "solicitud": {
                            "id": solicitud_id,
                            "estado": data.get("estado", "pendiente"),
                            "fecha": data.get("fecha", fecha_actual),
                            "cliente_id": data.get("cliente_id"),
                            "arquitecto_id": data.get("arquitecto_id")
                        },
                        "nota": f"Tu solicitud '{descripcion}' fue registrada. ID: {solicitud_id}",
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
                "error": "[WARN]  El servidor Rails no está disponible. Asegúrate de que esté corriendo en http://localhost:3000",
                "success": False,
                "creado_en_bd": False,
                "sugerencia": "Ejecuta: cd backend/APIREST && rails server"
            }
        
        except httpx.TimeoutException as e:
            logger.error(f"[ERROR]  Timeout conectando a Rails: {e}")
            return {
                "error": "Timeout conectando al servidor. Intenta de nuevo.",
                "success": False,
                "creado_en_bd": False
            }
        
        except Exception as e:
            logger.error(f"[ERROR]  Error inesperado: {e}")
            return {
                "error": f"No se pudo crear el proyecto: {str(e)}",
                "success": False,
                "creado_en_bd": False
            }

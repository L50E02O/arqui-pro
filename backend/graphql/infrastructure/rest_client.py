"""
HTTP Client para comunicarse con el API REST de Rails.
Usa httpx para peticiones asíncronas.
"""
import httpx
from typing import Optional, Dict, Any, List
from loguru import logger
import os
from dotenv import load_dotenv

load_dotenv()

class RestApiClient:
    """Cliente HTTP para comunicarse con el API REST de Rails"""
    
    def __init__(self):
        self.base_url = os.getenv("REST_API_URL", "http://localhost:3000/api/v1")

        self.timeout = 30.0

        
    async def _request(
        self,
        method: str,
        endpoint: str,
        json_data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Ejecuta una petición HTTP al API REST"""
        url = f"{self.base_url}/{endpoint}"
        
        default_headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        
        if headers:
            default_headers.update(headers)
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(
                    method=method,
                    url=url,
                    json=json_data,
                    params=params,
                    headers=default_headers
                )
                
                response.raise_for_status()
                
                # Si es 204 No Content, devolver dict vacío
                if response.status_code == 204:
                    return {}
                
                return response.json()
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP Error {e.response.status_code}: {e.response.text}")
            raise Exception(f"Error en API REST: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"Request Error: {str(e)}")
            raise Exception(f"Error de conexión con API REST: {str(e)}")
    
    # ==================== USUARIOS ====================
    
    async def get_usuarios(self, params: Optional[Dict] = None) -> List[Dict]:
        """GET /usuarios"""
        return await self._request("GET", "usuarios", params=params)
    
    async def get_usuario(self, usuario_id: str) -> Dict:
        """GET /usuarios/:id"""
        return await self._request("GET", f"usuarios/{usuario_id}")
    
    # ==================== CLIENTES ====================
    
    async def get_clientes(self, params: Optional[Dict] = None) -> List[Dict]:
        """GET /clientes"""
        return await self._request("GET", "clientes", params=params)
    
    async def get_cliente(self, cliente_id: str) -> Dict:
        """GET /clientes/:id"""
        return await self._request("GET", f"clientes/{cliente_id}")
    
    # ==================== ARQUITECTOS ====================
    
    async def get_arquitectos(self, params: Optional[Dict] = None) -> List[Dict]:
        """GET /arquitectos"""
        return await self._request("GET", "arquitectos", params=params)
    
    async def get_arquitecto(self, arquitecto_id: str) -> Dict:
        """GET /arquitectos/:id"""
        return await self._request("GET", f"arquitectos/{arquitecto_id}")
    
    # ==================== PROYECTOS ====================
    
    async def get_proyectos(self, params: Optional[Dict] = None) -> List[Dict]:
        """GET /proyectos"""
        return await self._request("GET", "proyectos", params=params)
    
    async def get_proyecto(self, proyecto_id: str) -> Dict:
        """GET /proyectos/:id"""
        return await self._request("GET", f"proyectos/{proyecto_id}")
    
    # ==================== MODERADORES ====================
    
    async def get_moderadores(self, params: Optional[Dict] = None) -> List[Dict]:
        """GET /moderadores"""
        return await self._request("GET", "moderadores", params=params)
    
    async def get_moderador(self, moderador_id: str) -> Dict:
        """GET /moderadores/:id"""
        return await self._request("GET", f"moderadores/{moderador_id}")
    
    # ==================== CONVERSACIONES ====================
    
    async def get_conversaciones(self, params: Optional[Dict] = None) -> List[Dict]:
        """GET /conversaciones"""
        return await self._request("GET", "conversaciones", params=params)
    
    async def get_conversacion(self, conversacion_id: str) -> Dict:
        """GET /conversaciones/:id"""
        return await self._request("GET", f"conversaciones/{conversacion_id}")
    
    # ==================== MENSAJES ====================
    
    async def get_mensajes(self, params: Optional[Dict] = None) -> List[Dict]:
        """GET /mensajes"""
        return await self._request("GET", "mensajes", params=params)
    
    async def get_mensaje(self, mensaje_id: str) -> Dict:
        """GET /mensajes/:id"""
        return await self._request("GET", f"mensajes/{mensaje_id}")
    
    # ==================== NOTIFICACIONES ====================
    
    async def get_notificaciones(self, params: Optional[Dict] = None) -> List[Dict]:
        """GET /notificaciones"""
        return await self._request("GET", "notificaciones", params=params)
    
    async def get_notificacion(self, notificacion_id: str) -> Dict:
        """GET /notificaciones/:id"""
        return await self._request("GET", f"notificaciones/{notificacion_id}")
    
    # ==================== SOLICITUDES PROYECTO ====================
    
    async def get_solicitudes_proyecto(self, params: Optional[Dict] = None) -> List[Dict]:
        """GET /solicitudes_proyecto"""
        return await self._request("GET", "solicitudes_proyecto", params=params)
    
    async def get_solicitud_proyecto(self, solicitud_id: str) -> Dict:
        """GET /solicitudes_proyecto/:id"""
        return await self._request("GET", f"solicitudes_proyecto/{solicitud_id}")
    
    # ==================== AVANCES ====================
    
    async def get_avances(self, params: Optional[Dict] = None) -> List[Dict]:
        """GET /avances"""
        return await self._request("GET", "avances", params=params)
    
    async def get_avance(self, avance_id: str) -> Dict:
        """GET /avances/:id"""
        return await self._request("GET", f"avances/{avance_id}")
    
    # ==================== INCIDENCIAS ====================
    
    async def get_incidencias(self, params: Optional[Dict] = None) -> List[Dict]:
        """GET /incidencias"""
        return await self._request("GET", "incidencias", params=params)
    
    async def get_incidencia(self, incidencia_id: str) -> Dict:
        """GET /incidencias/:id"""
        return await self._request("GET", f"incidencias/{incidencia_id}")
    
    # ==================== VALORACIONES ====================
    
    async def get_valoraciones(self, params: Optional[Dict] = None) -> List[Dict]:
        """GET /valoraciones"""
        return await self._request("GET", "valoraciones", params=params)
    
    async def get_valoracion(self, valoracion_id: str) -> Dict:
        """GET /valoraciones/:id"""
        return await self._request("GET", f"valoraciones/{valoracion_id}")
    
    # ==================== VERIFICACIONES ====================
    
    async def get_verificaciones(self, params: Optional[Dict] = None) -> List[Dict]:
        """GET /verificaciones"""
        return await self._request("GET", "verificaciones", params=params)
    
    async def get_verificacion(self, verificacion_id: str) -> Dict:
        """GET /verificaciones/:id"""
        return await self._request("GET", f"verificaciones/{verificacion_id}")
    
    # ==================== IMÁGENES ====================
    
    async def get_imagenes(self, params: Optional[Dict] = None) -> List[Dict]:
        """GET /imagenes"""
        return await self._request("GET", "imagenes", params=params)
    
    async def get_imagen(self, imagen_id: str) -> Dict:
        """GET /imagenes/:id"""
        return await self._request("GET", f"imagenes/{imagen_id}")
    
    # ==================== IMAGEN ASOCIACIONES ====================
    
    async def get_imagen_asociaciones(self, params: Optional[Dict] = None) -> List[Dict]:
        """GET /imagen_asociaciones"""
        return await self._request("GET", "imagen_asociaciones", params=params)
    
    async def get_imagen_asociacion(self, asociacion_id: str) -> Dict:
        """GET /imagen_asociaciones/:id"""
        return await self._request("GET", f"imagen_asociaciones/{asociacion_id}")


# Singleton instance
rest_client = RestApiClient()

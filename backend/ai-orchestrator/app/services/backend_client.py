"""
Backend Client - Cliente HTTP centralizado para comunicación con Rails API
Maneja autenticación y tokens JWT
"""

from typing import Dict, Any, Optional
import httpx
from loguru import logger

from app.config import settings


class BackendClient:
    """
    Cliente HTTP centralizado para comunicar con Rails API.
    Maneja autenticación y tokens JWT.
    """
    
    def __init__(self, auth_token: Optional[str] = None):
        self.base_url = settings.RAILS_API_URL
        self.auth_token = auth_token
        self.timeout = 15.0
    
    def _get_headers(self) -> Dict[str, str]:
        """Obtener headers con autenticación si está disponible"""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        if settings.RAILS_API_KEY:
            headers["X-API-Key"] = settings.RAILS_API_KEY
        
        return headers
    
    async def get(self, endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """
        GET request al backend.
        
        Args:
            endpoint: Ruta del endpoint (ej: "/arquitectos")
            params: Query params opcionales
            
        Returns:
            Respuesta JSON del servidor
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url,
                    params=params,
                    headers=self._get_headers(),
                    timeout=self.timeout
                )
                
                return {
                    "success": response.status_code == 200,
                    "status_code": response.status_code,
                    "data": response.json() if response.status_code == 200 else None,
                    "error": response.text if response.status_code != 200 else None
                }
                
        except httpx.ConnectError as e:
            logger.error(f"[ERROR]  No se puede conectar a {url}: {e}")
            return {
                "success": False,
                "status_code": 0,
                "data": None,
                "error": "No se puede conectar al servidor Rails",
                "sugerencia": "Ejecuta 'rails server' en backend/APIREST"
            }
        except Exception as e:
            logger.error(f"[ERROR]  Error en GET {url}: {e}")
            return {
                "success": False,
                "status_code": 0,
                "data": None,
                "error": str(e)
            }
    
    async def post(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        POST request al backend.
        
        Args:
            endpoint: Ruta del endpoint (ej: "/proyectos")
            data: Datos a enviar en el body
            
        Returns:
            Respuesta JSON del servidor
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    json=data,
                    headers=self._get_headers(),
                    timeout=self.timeout
                )
                
                success = response.status_code in [200, 201]
                
                return {
                    "success": success,
                    "status_code": response.status_code,
                    "data": response.json() if success else None,
                    "error": response.text if not success else None
                }
                
        except httpx.ConnectError as e:
            logger.error(f"[ERROR]  No se puede conectar a {url}: {e}")
            return {
                "success": False,
                "status_code": 0,
                "data": None,
                "error": "No se puede conectar al servidor Rails",
                "sugerencia": "Ejecuta 'rails server' en backend/APIREST"
            }
        except Exception as e:
            logger.error(f"[ERROR]  Error en POST {url}: {e}")
            return {
                "success": False,
                "status_code": 0,
                "data": None,
                "error": str(e)
            }
    
    async def patch(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        PATCH request al backend.
        
        Args:
            endpoint: Ruta del endpoint (ej: "/proyectos/1")
            data: Datos a actualizar
            
        Returns:
            Respuesta JSON del servidor
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.patch(
                    url,
                    json=data,
                    headers=self._get_headers(),
                    timeout=self.timeout
                )
                
                success = response.status_code in [200, 204]
                
                return {
                    "success": success,
                    "status_code": response.status_code,
                    "data": response.json() if success and response.status_code == 200 else None,
                    "error": response.text if not success else None
                }
                
        except httpx.ConnectError as e:
            logger.error(f"[ERROR]  No se puede conectar a {url}: {e}")
            return {
                "success": False,
                "status_code": 0,
                "data": None,
                "error": "No se puede conectar al servidor Rails"
            }
        except Exception as e:
            logger.error(f"[ERROR]  Error en PATCH {url}: {e}")
            return {
                "success": False,
                "status_code": 0,
                "data": None,
                "error": str(e)
            }
    
    async def delete(self, endpoint: str) -> Dict[str, Any]:
        """
        DELETE request al backend.
        
        Args:
            endpoint: Ruta del endpoint (ej: "/proyectos/1")
            
        Returns:
            Respuesta del servidor
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    url,
                    headers=self._get_headers(),
                    timeout=self.timeout
                )
                
                success = response.status_code in [200, 204]
                
                return {
                    "success": success,
                    "status_code": response.status_code,
                    "error": response.text if not success else None
                }
                
        except httpx.ConnectError as e:
            logger.error(f"[ERROR]  No se puede conectar a {url}: {e}")
            return {
                "success": False,
                "status_code": 0,
                "error": "No se puede conectar al servidor Rails"
            }
        except Exception as e:
            logger.error(f"[ERROR]  Error en DELETE {url}: {e}")
            return {
                "success": False,
                "status_code": 0,
                "error": str(e)
            }
    
    async def health_check(self) -> bool:
        """Verificar conexión con el backend"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url.replace('/api/v1', '')}/up",
                    timeout=5.0
                )
                return response.status_code == 200
        except:
            return False


# Instancia global (opcional)
backend_client = BackendClient()

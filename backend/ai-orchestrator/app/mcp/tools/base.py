"""
MCP Tool Base - Clase abstracta para todas las tools
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List
from loguru import logger
import time


class MCPTool(ABC):
    """
    Clase base para todas las MCP Tools.
    Define la interfaz que deben implementar todas las herramientas.
    """
    
    def __init__(self):
        self.name = self.get_name()
        self.description = self.get_description()
        self.parameters = self.get_parameters()
        self.required_permissions = self.get_required_permissions()
    
    @abstractmethod
    def get_name(self) -> str:
        """Nombre único de la tool"""
        pass
    
    @abstractmethod
    def get_description(self) -> str:
        """Descripción de qué hace la tool"""
        pass
    
    @abstractmethod
    def get_parameters(self) -> Dict[str, Any]:
        """
        Esquema de parámetros en formato JSON Schema.
        
        Formato:
        {
            "type": "object",
            "properties": {
                "param_name": {
                    "type": "string",
                    "description": "descripción"
                }
            },
            "required": ["param_name"]
        }
        """
        pass
    
    @abstractmethod
    def get_required_permissions(self) -> List[str]:
        """
        Lista de permisos requeridos para ejecutar esta tool.
        Ej: ["cliente", "moderador"] o ["arquitecto"]
        """
        pass
    
    @abstractmethod
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """
        Ejecuta la acción de la tool.
        
        Args:
            **kwargs: Parámetros de la tool
            
        Returns:
            Dict con el resultado de la ejecución
        """
        pass
    
    def validate_permissions(self, user_role: str) -> bool:
        """Valida si el usuario tiene permisos"""
        if not self.required_permissions:
            return True  # Sin restricciones
        return user_role in self.required_permissions
    
    async def safe_execute(self, user_role: str = None, **kwargs) -> Dict[str, Any]:
        """
        Ejecuta la tool con validación de permisos y manejo de errores.
        
        Returns:
            {
                "success": bool,
                "data": Any,
                "error": str | None,
                "execution_time_ms": float
            }
        """
        start_time = time.time()
        
        try:
            # Validar permisos
            if user_role and not self.validate_permissions(user_role):
                return {
                    "success": False,
                    "data": None,
                    "error": f"Usuario sin permisos para ejecutar {self.name}",
                    "execution_time_ms": 0
                }
            
            # Ejecutar tool
            result = await self.execute(**kwargs)
            
            execution_time = (time.time() - start_time) * 1000
            
            return {
                "success": True,
                "data": result,
                "error": None,
                "execution_time_ms": round(execution_time, 2)
            }
            
        except Exception as e:
            execution_time = (time.time() - start_time) * 1000
            logger.error(f"Error ejecutando {self.name}: {e}")
            
            return {
                "success": False,
                "data": None,
                "error": str(e),
                "execution_time_ms": round(execution_time, 2)
            }
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte la tool a diccionario (para pasar al LLM)"""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters
            }
        }

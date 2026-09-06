"""
LLM Adapter - Patrón Strategy
Interface abstracta para intercambiar proveedores de IA
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from loguru import logger


class LLMAdapter(ABC):
    """
    Interface abstracta para proveedores de LLM.
    Implementa el patrón Strategy para intercambiar proveedores sin modificar lógica.
    """
    
    def __init__(self, model: str, api_key: str):
        self.model = model
        self.api_key = api_key
        self._validate_credentials()
    
    @abstractmethod
    def _validate_credentials(self):
        """Validar que las credenciales sean válidas"""
        pass
    
    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        **kwargs
    ) -> str:
        """
        Genera texto basado en un prompt.
        
        Args:
            prompt: Mensaje del usuario
            system_prompt: Instrucciones del sistema
            temperature: Creatividad (0-1)
            max_tokens: Máximo de tokens a generar
            
        Returns:
            str: Respuesta generada
        """
        pass
    
    @abstractmethod
    async def generate_with_tools(
        self,
        prompt: str,
        tools: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Genera respuesta y decide qué tools ejecutar.
        
        Args:
            prompt: Mensaje del usuario
            tools: Lista de tools disponibles
            system_prompt: Instrucciones del sistema
            
        Returns:
            {
                "content": "respuesta en texto",
                "tool_calls": [
                    {
                        "tool_name": "nombre_tool",
                        "arguments": {"param1": "value1"}
                    }
                ]
            }
        """
        pass
    
    @abstractmethod
    async def analyze_image(
        self,
        image_data: bytes,
        prompt: str,
        **kwargs
    ) -> str:
        """
        Analiza una imagen (vision capability).
        
        Args:
            image_data: Bytes de la imagen
            prompt: Pregunta sobre la imagen
            
        Returns:
            str: Análisis de la imagen
        """
        pass
    
    @property
    @abstractmethod
    def supports_vision(self) -> bool:
        """Indica si el modelo soporta visión"""
        pass
    
    @property
    @abstractmethod
    def supports_function_calling(self) -> bool:
        """Indica si el modelo soporta function calling"""
        pass
    
    def get_provider_name(self) -> str:
        """Retorna el nombre del proveedor"""
        return self.__class__.__name__.replace("Adapter", "").lower()

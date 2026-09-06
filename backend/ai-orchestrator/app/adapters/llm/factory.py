"""
LLM Factory - Patrón Factory para crear adapters
"""

from typing import Optional
from loguru import logger

from app.config import settings
from .base import LLMAdapter
from .gemini_adapter import GeminiAdapter
from .openai_adapter import OpenAIAdapter
from .groq_adapter import GroqAdapter


class LLMFactory:
    """
    Factory para crear LLM adapters según configuración.
    Implementa patrón Factory + Strategy.
    """
    
    @staticmethod
    def create_adapter(provider: Optional[str] = None) -> LLMAdapter:
        """
        Crea un adapter según el proveedor.
        
        Args:
            provider: "openai" | "gemini" | "claude" | "groq" | None (usa el configurado)
            
        Returns:
            LLMAdapter: Instancia del adapter correspondiente
            
        Raises:
            ValueError: Si el proveedor no es válido
        """
        provider = provider or settings.ACTIVE_LLM_PROVIDER
        provider = provider.lower()
        
        logger.info(f"[AI]  Creando LLM Adapter: provider={provider}")
        
        if provider == "gemini":
            if not settings.GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY no configurada")
            return GeminiAdapter(
                model=settings.GEMINI_MODEL,
                api_key=settings.GEMINI_API_KEY
            )
        
        elif provider == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY no configurada")
            return OpenAIAdapter(
                model=settings.OPENAI_MODEL,
                api_key=settings.OPENAI_API_KEY
            )
        
        elif provider == "groq":
            if not settings.GROQ_API_KEY:
                raise ValueError("GROQ_API_KEY no configurada")
            return GroqAdapter(
                model=settings.GROQ_MODEL,
                api_key=settings.GROQ_API_KEY
            )
        
        elif provider == "claude":
            # TODO: Implementar ClaudeAdapter si se necesita
            raise NotImplementedError("Claude adapter aún no implementado")
        
        else:
            raise ValueError(
                f"Proveedor LLM no válido: {provider}. "
                f"Opciones: openai, gemini, claude, groq"
            )
    
    @staticmethod
    def get_available_providers() -> list:
        """Retorna lista de proveedores disponibles según config"""
        available = []
        
        if settings.GROQ_API_KEY:
            available.append("groq")
        if settings.GEMINI_API_KEY:
            available.append("gemini")
        if settings.OPENAI_API_KEY:
            available.append("openai")
        if settings.ANTHROPIC_API_KEY:
            available.append("claude")
        
        return available

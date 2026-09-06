"""
Groq Adapter - API gratuita y ultrarrápida
Soporta: llama3-70b, llama3-8b, mixtral-8x7b, gemma-7b
"""

from typing import List, Dict, Any, Optional
from openai import OpenAI
from loguru import logger
from .base import LLMAdapter
import json


class GroqAdapter(LLMAdapter):
    """Adapter para Groq API (gratis y ultrarrápido)"""
    
    def __init__(self, model: str = "llama-3.1-8b-instant", api_key: str = None):
        self.model = model
        self.api_key = api_key
        self._validate_credentials()
        
        # Groq usa cliente compatible con OpenAI
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1"
        )
    
    def _validate_credentials(self):
        """Validar API key de Groq"""
        if not self.api_key:
            raise ValueError("GROQ_API_KEY no configurada")
        logger.info(f"[SUCCESS]  Groq configurado: modelo={self.model}")
    
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        **kwargs
    ) -> str:
        """Generar texto simple"""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        return response.choices[0].message.content
    
    async def generate_with_tools(
        self,
        prompt: str,
        tools: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Generar con tools (function calling)"""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=tools,
            tool_choice="auto",
            temperature=kwargs.get("temperature", 0.7),
            max_tokens=kwargs.get("max_tokens", 2048)
        )
        
        message = response.choices[0].message
        
        result = {
            "content": message.content or "",
            "tool_calls": []
        }
        
        if hasattr(message, "tool_calls") and message.tool_calls:
            for tc in message.tool_calls:
                result["tool_calls"].append({
                    "tool_name": tc.function.name,
                    "arguments": json.loads(tc.function.arguments)
                })
        
        return result
    
    async def analyze_image(
        self,
        image_data: bytes,
        prompt: str,
        mime_type: str = "image/jpeg"
    ) -> str:
        """Groq no soporta visión actualmente"""
        raise NotImplementedError(
            "Groq no soporta análisis de imágenes. Usa GPT-4V (OpenAI) o llava (Ollama)"
        )
    
    def supports_vision(self) -> bool:
        """Groq no soporta visión"""
        return False
    
    def supports_function_calling(self) -> bool:
        """Groq soporta function calling"""
        return True
    
    async def generate(
        self,
        messages: List[Dict[str, str]],
        tools: List[Dict[str, Any]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Generar respuesta con Groq (método alternativo)"""
        try:
            params = {
                "model": self.model,
                "messages": messages,
                "temperature": kwargs.get("temperature", 0.7),
                "max_tokens": kwargs.get("max_tokens", 2048),
            }
            
            if tools:
                params["tools"] = tools
                params["tool_choice"] = "auto"
            
            response = self.client.chat.completions.create(**params)
            message = response.choices[0].message
            
            result = {
                "content": message.content or "",
                "model": response.model,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                },
                "finish_reason": response.choices[0].finish_reason
            }
            
            if hasattr(message, "tool_calls") and message.tool_calls:
                result["tool_calls"] = [
                    {
                        "id": tc.id,
                        "type": tc.type,
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    }
                    for tc in message.tool_calls
                ]
            
            return result
            
        except Exception as e:
            logger.error(f"[ERROR]  Error generando con Groq: {e}")
            raise
    
    async def generate_with_vision(
        self,
        prompt: str,
        image_data: bytes,
        mime_type: str = "image/jpeg",
        **kwargs
    ) -> Dict[str, Any]:
        """Groq no soporta visión"""
        raise NotImplementedError(
            "Groq no soporta visión. Usa GPT-4V (OpenAI) o llava (Ollama)"
        )
    
    def get_provider_name(self) -> str:
        return "groq"


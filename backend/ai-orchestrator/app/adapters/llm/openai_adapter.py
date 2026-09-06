"""
OpenAI Adapter - Implementación de LLMAdapter para OpenAI GPT
"""

from openai import AsyncOpenAI
from typing import Dict, Any, Optional, List
import json
import base64
from loguru import logger

from .base import LLMAdapter


class OpenAIAdapter(LLMAdapter):
    """
    Adapter para OpenAI.
    Modelos disponibles: gpt-4-turbo-preview, gpt-4, gpt-3.5-turbo
    """
    
    def __init__(self, model: str, api_key: str):
        super().__init__(model, api_key)
        self.client = AsyncOpenAI(api_key=api_key)
    
    def _validate_credentials(self):
        """Validar API key de OpenAI"""
        if not self.api_key or not self.api_key.startswith("sk-"):
            raise ValueError("OPENAI_API_KEY inválida o no configurada")
        
        logger.info(f"[SUCCESS]  OpenAI configurado: modelo={self.model}")
    
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        **kwargs
    ) -> str:
        """Genera texto con OpenAI"""
        try:
            messages = []
            
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            messages.append({"role": "user", "content": prompt})
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error en OpenAI generate_text: {e}")
            raise
    
    async def generate_with_tools(
        self,
        prompt: str,
        tools: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Genera respuesta y decide tools con OpenAI Function Calling.
        """
        try:
            messages = []
            
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            messages.append({"role": "user", "content": prompt})
            
            # Convertir MCP tools al formato de OpenAI
            openai_tools = self._convert_to_openai_tools(tools)
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=openai_tools,
                tool_choice="auto"  # El modelo decide si usa tools
            )
            
            message = response.choices[0].message
            
            # Extraer tool calls
            tool_calls = []
            if message.tool_calls:
                for tool_call in message.tool_calls:
                    tool_calls.append({
                        "tool_name": tool_call.function.name,
                        "arguments": json.loads(tool_call.function.arguments)
                    })
            
            content = message.content if message.content else ""
            
            return {
                "content": content,
                "tool_calls": tool_calls
            }
            
        except Exception as e:
            logger.error(f"Error en OpenAI generate_with_tools: {e}")
            # Fallback
            text = await self.generate_text(prompt, system_prompt)
            return {"content": text, "tool_calls": []}
    
    async def analyze_image(
        self,
        image_data: bytes,
        prompt: str,
        **kwargs
    ) -> str:
        """Analiza imagen con GPT-4 Vision"""
        try:
            # Convertir imagen a base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            response = await self.client.chat.completions.create(
                model="gpt-4-vision-preview",  # Modelo específico para visión
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error en OpenAI analyze_image: {e}")
            raise
    
    @property
    def supports_vision(self) -> bool:
        """GPT-4 y variantes soportan visión"""
        return "gpt-4" in self.model.lower()
    
    @property
    def supports_function_calling(self) -> bool:
        """Todos los modelos recientes soportan function calling"""
        return True
    
    def _convert_to_openai_tools(self, mcp_tools: List[Dict[str, Any]]) -> List[Dict]:
        """
        Convierte MCP tools al formato de OpenAI.
        
        Formato OpenAI:
        {
            "type": "function",
            "function": {
                "name": "tool_name",
                "description": "descripción",
                "parameters": {...}
            }
        }
        
        Maneja tanto el formato interno como el ya convertido.
        """
        openai_tools = []
        
        for tool in mcp_tools:
            # Si ya está en formato OpenAI (tiene "type": "function" y "function")
            if tool.get("type") == "function" and "function" in tool:
                function_data = tool["function"]
                openai_tool = {
                    "type": "function",
                    "function": {
                        "name": function_data.get("name", "unknown"),
                        "description": function_data.get("description", ""),
                        "parameters": function_data.get("parameters", {
                            "type": "object",
                            "properties": {},
                            "required": []
                        })
                    }
                }
            else:
                # Formato interno MCP
                openai_tool = {
                    "type": "function",
                    "function": {
                        "name": tool.get("name", "unknown"),
                        "description": tool.get("description", ""),
                        "parameters": tool.get("parameters", {
                            "type": "object",
                            "properties": {},
                            "required": []
                        })
                    }
                }
            openai_tools.append(openai_tool)
        
        return openai_tools

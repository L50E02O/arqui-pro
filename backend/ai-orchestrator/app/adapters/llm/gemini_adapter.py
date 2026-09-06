"""
Gemini Adapter - Implementación de LLMAdapter para Google Gemini
"""

import google.generativeai as genai
from typing import Dict, Any, Optional, List
import json
from loguru import logger

from .base import LLMAdapter


class GeminiAdapter(LLMAdapter):
    """
    Adapter para Google Gemini.
    Modelos disponibles: gemini-1.5-pro, gemini-1.5-flash
    """
    
    def _validate_credentials(self):
        """Validar API key de Gemini"""
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY no configurada")
        
        genai.configure(api_key=self.api_key)
        logger.info(f"[SUCCESS]  Gemini configurado: modelo={self.model}")
    
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        **kwargs
    ) -> str:
        """Genera texto con Gemini"""
        try:
            model = genai.GenerativeModel(self.model)
            
            # Combinar system prompt + user prompt
            full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
            
            generation_config = {
                "temperature": temperature,
                "max_output_tokens": max_tokens,
            }
            
            response = model.generate_content(
                full_prompt,
                generation_config=generation_config
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Error en Gemini generate_text: {e}")
            raise
    
    async def generate_with_tools(
        self,
        prompt: str,
        tools: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Genera respuesta y decide tools con Gemini Function Calling.
        
        Gemini soporta function calling nativamente.
        """
        try:
            # Convertir MCP tools al formato de Gemini
            gemini_tools = self._convert_to_gemini_tools(tools)
            
            model = genai.GenerativeModel(
                self.model,
                tools=gemini_tools
            )
            
            # Combinar prompts
            full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
            
            chat = model.start_chat()
            response = chat.send_message(full_prompt)
            
            # Extraer function calls
            tool_calls = []
            if response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'function_call') and part.function_call:
                        fc = part.function_call
                        tool_calls.append({
                            "tool_name": fc.name,
                            "arguments": dict(fc.args)
                        })
            
            # Si no hay function calls, retornar texto
            content = response.text if not tool_calls else ""
            
            return {
                "content": content,
                "tool_calls": tool_calls
            }
            
        except Exception as e:
            logger.error(f"Error en Gemini generate_with_tools: {e}")
            # Fallback: generar texto sin tools
            text = await self.generate_text(prompt, system_prompt)
            return {"content": text, "tool_calls": []}
    
    async def analyze_image(
        self,
        image_data: bytes,
        prompt: str,
        **kwargs
    ) -> str:
        """Analiza imagen con Gemini Vision"""
        try:
            model = genai.GenerativeModel(self.model)
            
            # Gemini acepta images como parte del prompt
            response = model.generate_content([
                prompt,
                {"mime_type": "image/jpeg", "data": image_data}
            ])
            
            return response.text
            
        except Exception as e:
            logger.error(f"Error en Gemini analyze_image: {e}")
            raise
    
    @property
    def supports_vision(self) -> bool:
        """Gemini Pro soporta visión"""
        return "pro" in self.model.lower() or "flash" in self.model.lower()
    
    @property
    def supports_function_calling(self) -> bool:
        """Gemini soporta function calling"""
        return True
    
    def _convert_to_gemini_tools(self, mcp_tools: List[Dict[str, Any]]) -> List:
        """
        Convierte MCP tools al formato de Gemini.
        
        Formato Gemini:
        {
            "name": "tool_name",
            "description": "descripción",
            "parameters": {
                "type": "object",
                "properties": {...},
                "required": [...]
            }
        }
        """
        gemini_tools = []
        
        for tool in mcp_tools:
            gemini_tool = {
                "name": tool["name"],
                "description": tool["description"],
                "parameters": tool.get("parameters", {
                    "type": "object",
                    "properties": {},
                    "required": []
                })
            }
            gemini_tools.append(gemini_tool)
        
        return gemini_tools

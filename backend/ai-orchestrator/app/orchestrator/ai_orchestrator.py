"""
AI Orchestrator - Cerebro del sistema
Orquesta LLM + MCP Tools + Multimodal Processing
"""

from typing import Dict, Any, Optional, List
from loguru import logger
from datetime import datetime

from app.adapters.llm import LLMFactory, LLMAdapter
from app.mcp import MCPServer
from app.multimodal import MultimodalProcessorFactory
from app.models.schemas import ChatResponse, ToolExecution
from app.config import settings


class AIOrchestrator:
    """
    Orquestador principal del sistema de IA.
    Coordina LLM, MCP Tools y procesamiento multimodal.
    """
    
    def __init__(self):
        # Inicializar LLM Adapter (patrón Strategy)
        self.llm_adapter: LLMAdapter = LLMFactory.create_adapter()
        
        # Inicializar MCP Server
        self.mcp_server = MCPServer()
        
        # System prompt para el LLM
        self.system_prompt = self._build_system_prompt()
        
        logger.info("[AI]  AI Orchestrator inicializado")
        logger.info(f"   LLM: {self.llm_adapter.get_provider_name()}")
        logger.info(f"   Tools: {len(self.mcp_server.tools)}")
    
    def _build_system_prompt(self, user_id: str = None, user_role: str = None) -> str:
        """Construye el system prompt con contexto del negocio y del usuario"""
        base_prompt = """Eres el asistente IA de ArquiPro, plataforma de arquitectura.

INFORMACIÓN DEL USUARIO ACTUAL:
- user_id: {user_id}
- rol: {user_role}

TOOLS DISPONIBLES Y CUÁNDO USARLAS:
1. buscar_arquitectos - Buscar arquitectos por ubicación, especialidad o nombre
2. listar_proyectos - Ver proyectos existentes (puede filtrar por arquitecto_id o cliente_id)
3. obtener_proyecto - Ver detalles de un proyecto específico por su ID
4. estadisticas_arquitecto - Ver estadísticas de un arquitecto (usa el user_id del usuario si es arquitecto)
5. crear_proyecto - Crear nuevo proyecto (solo arquitectos)
6. crear_solicitud - Crear solicitud de proyecto (solo clientes)
7. publicar_avance - Publicar avance en un proyecto (solo arquitectos)
8. verificaciones - Ver verificaciones de arquitectos

REGLAS IMPORTANTES:
1. SIEMPRE usa las tools cuando el usuario pida información o acciones
2. Para "mis estadísticas" o "mi perfil" de un arquitecto → usa estadisticas_arquitecto con arquitecto_id={user_id}
3. Para "mis proyectos" → usa listar_proyectos con el ID del usuario según su rol
4. NO pidas IDs al usuario si ya tienes su user_id en el contexto
5. Responde en español de forma amigable y concisa
6. Si una tool falla, explica el error al usuario de forma clara"""
        
        return base_prompt.format(
            user_id=user_id or "desconocido",
            user_role=user_role or "usuario"
        )
    
    async def process_text_message(
        self,
        message: str,
        user_id: str,
        conversation_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> ChatResponse:
        """
        Procesa un mensaje de texto simple.
        
        Args:
            message: Texto del usuario
            user_id: ID del usuario
            conversation_id: ID de conversación
            context: Contexto adicional (ej: rol del usuario)
            
        Returns:
            ChatResponse con respuesta y tools ejecutadas
        """
        logger.info(f"[CHAT]  Procesando mensaje de {user_id}: {message[:50]}...")
        
        # Extraer rol del contexto
        user_role = context.get("rol") if context else None
        
        # Construir system prompt con contexto del usuario
        system_prompt = self._build_system_prompt(user_id=user_id, user_role=user_role)
        
        try:
            # Obtener tools disponibles
            tools = self.mcp_server.get_available_tools()
            
            # Generar respuesta con LLM (con function calling)
            try:
                llm_response = await self.llm_adapter.generate_with_tools(
                    prompt=message,
                    tools=tools if tools else None,
                    system_prompt=system_prompt
                )
            except Exception as llm_error:
                # Si falla el function calling, intentar sin tools
                logger.warning(f"[WARN]   Error en function calling: {llm_error}, reintentando sin tools")
                llm_response = {
                    "content": await self.llm_adapter.generate_text(
                        prompt=message,
                        system_prompt=system_prompt
                    ),
                    "tool_calls": []
                }
            
            content = llm_response["content"]
            tool_calls = llm_response.get("tool_calls", [])
            
            # Ejecutar tools si el LLM las invocó
            tools_executed = []
            
            if tool_calls:
                logger.info(f"[TOOL]  LLM invocó {len(tool_calls)} tools")
                auth_token = context.get("auth_token") if context else None
                
                for call in tool_calls:
                    tool_name = call["tool_name"]
                    arguments = call["arguments"]
                    
                    # Verificar que la tool exista
                    if tool_name not in self.mcp_server.tools:
                        logger.warning(f"[WARN]   Tool '{tool_name}' no existe, ignorando")
                        continue
                    
                    # Pasar contexto completo del usuario a los tools
                    arguments["context"] = {
                        "user_id": user_id,
                        "user_role": user_role,
                        "auth_token": auth_token  # Token JWT para autenticación
                    }
                    
                    result = await self.mcp_server.execute_tool(
                        tool_name=tool_name,
                        params=arguments,
                        user_role=user_role
                    )
                    
                    tools_executed.append(ToolExecution(
                        tool_name=tool_name,
                        params=arguments,
                        result=result.get("data"),
                        success=result["success"],
                        execution_time_ms=result["execution_time_ms"]
                    ))
                
                # Si el LLM no generó texto, generamos respuesta con resultados
                if not content:
                    content = await self._generate_response_from_tools(
                        message, tools_executed
                    )
            
            return ChatResponse(
                content=content,
                user_id=user_id,
                conversation_id=conversation_id,
                tools_executed=tools_executed,
                llm_provider=self.llm_adapter.get_provider_name(),
                timestamp=datetime.utcnow().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Error procesando mensaje: {e}")
            
            # Fallback: respuesta de error amigable
            return ChatResponse(
                content=f"Lo siento, ocurrió un error procesando tu mensaje: {str(e)}",
                user_id=user_id,
                conversation_id=conversation_id,
                tools_executed=[],
                llm_provider=self.llm_adapter.get_provider_name(),
                timestamp=datetime.utcnow().isoformat()
            )
    
    async def process_multimodal_message(
        self,
        message: str,
        user_id: str,
        conversation_id: Optional[str] = None,
        file_data: Optional[Dict[str, Any]] = None
    ) -> ChatResponse:
        """
        Procesa un mensaje multimodal (texto + archivo).
        
        Args:
            message: Texto del usuario
            user_id: ID del usuario
            conversation_id: ID de conversación
            file_data: {
                "filename": str,
                "content_type": str,
                "data": bytes
            }
            
        Returns:
            ChatResponse con análisis del archivo y respuesta
        """
        logger.info(f"[MULTIMODAL]  Procesando mensaje multimodal de {user_id}")
        
        try:
            extra_context = ""
            
            # Procesar archivo si existe
            if file_data:
                content_type = file_data["content_type"]
                data = file_data["data"]
                filename = file_data["filename"]
                
                logger.info(f"[ATTACH]  Archivo recibido: {filename} ({content_type})")
                
                # Obtener procesador adecuado
                processor = MultimodalProcessorFactory.get_processor(content_type)
                
                if processor:
                    processed = await processor.process(data)
                    
                    # Agregar contenido extraído al contexto
                    if processed["type"] == "image":
                        if processed.get("has_text"):
                            extra_context = f"\n\n[Texto extraído de imagen '{filename}':\n{processed['text']}]"
                        else:
                            # Si el LLM soporta visión, analizar imagen
                            if self.llm_adapter.supports_vision:
                                image_analysis = await self.llm_adapter.analyze_image(
                                    data, message
                                )
                                extra_context = f"\n\n[Análisis de imagen:\n{image_analysis}]"
                    
                    elif processed["type"] == "pdf":
                        extra_context = f"\n\n[Contenido del PDF '{filename}':\n{processed['text'][:2000]}...]"  # Limitar chars
                
                else:
                    extra_context = f"\n\n[Archivo '{filename}' de tipo {content_type} no pudo ser procesado]"
            
            # Combinar mensaje + contexto del archivo
            full_message = message + extra_context
            
            # Procesar como mensaje de texto normal
            response = await self.process_text_message(
                message=full_message,
                user_id=user_id,
                conversation_id=conversation_id
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error procesando mensaje multimodal: {e}")
            
            return ChatResponse(
                content=f"Error procesando el archivo: {str(e)}",
                user_id=user_id,
                conversation_id=conversation_id,
                tools_executed=[],
                llm_provider=self.llm_adapter.get_provider_name(),
                timestamp=datetime.utcnow().isoformat()
            )
    
    async def _generate_response_from_tools(
        self,
        original_message: str,
        tools_executed: List[ToolExecution]
    ) -> str:
        """
        Genera respuesta en lenguaje natural basada en resultados de tools.
        Se usa cuando el LLM solo invocó tools sin generar texto.
        """
        # Construir prompt con resultados
        results_text = []
        for tool in tools_executed:
            if tool.success:
                results_text.append(f"Tool '{tool.tool_name}' ejecutada: {tool.result}")
            else:
                results_text.append(f"Tool '{tool.tool_name}' falló")
        
        prompt = f"""
Usuario preguntó: {original_message}

Se ejecutaron las siguientes herramientas:
{chr(10).join(results_text)}

Genera una respuesta clara y útil en lenguaje natural basada en estos resultados.
"""
        
        response = await self.llm_adapter.generate_text(
            prompt=prompt,
            system_prompt=self.system_prompt,
            temperature=0.7
        )
        
        return response

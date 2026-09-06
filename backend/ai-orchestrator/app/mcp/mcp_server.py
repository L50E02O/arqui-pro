"""
MCP Server - Orquestador de MCP Tools
Solo las 4 tools principales activas
"""

from typing import Dict, Any, List, Optional
from loguru import logger

from .tools.base import MCPTool
from .tools.buscar_arquitectos import BuscarArquitectosTool
from .tools.crear_avance import CrearAvanceTool
from .tools.crear_proyecto import CrearProyectoTool
from .tools.estadisticas_arquitecto import EstadisticasArquitectoTool
from .tools.listar_proyectos import ListarProyectosTool

from app.config import settings


class MCPServer:
    """
    Servidor MCP que gestiona las tools disponibles.
    Provee interfaz para que el AI Orchestrator ejecute herramientas.
    Todas las tools se conectan a datos REALES del backend Rails.
    """
    
    def __init__(self):
        self.tools: Dict[str, MCPTool] = {}
        self._register_tools()
        logger.info(f"[TOOL]  MCP Server inicializado con {len(self.tools)} tools REALES")
    
    def _register_tools(self):
        """Registra las 5 tools principales"""
        available_tools = [
            BuscarArquitectosTool(),
            CrearAvanceTool(),
            CrearProyectoTool(),
            EstadisticasArquitectoTool(),
            ListarProyectosTool()
        ]
        
        # Filtrar solo las tools habilitadas en config
        enabled_names = settings.enabled_tools_list
        
        for tool in available_tools:
            if tool.name in enabled_names:
                self.tools[tool.name] = tool
                logger.debug(f"  [OK]  Tool registrada: {tool.name}")
            else:
                logger.debug(f"   Tool deshabilitada: {tool.name}")
    
    def get_available_tools(self) -> List[Dict[str, Any]]:
        """
        Retorna lista de tools en formato para el LLM.
        
        Returns:
            [
                {
                    "name": "tool_name",
                    "description": "...",
                    "parameters": {...}
                }
            ]
        """
        return [tool.to_dict() for tool in self.tools.values()]
    
    def get_tool(self, tool_name: str) -> Optional[MCPTool]:
        """Obtiene una tool por nombre"""
        return self.tools.get(tool_name)
    
    async def execute_tool(
        self,
        tool_name: str,
        params: Dict[str, Any],
        user_role: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Ejecuta una tool con validación de permisos.
        
        Args:
            tool_name: Nombre de la tool
            params: Parámetros para la tool
            user_role: Rol del usuario (para validar permisos)
            
        Returns:
            {
                "success": bool,
                "data": Any,
                "error": str | None,
                "execution_time_ms": float
            }
        """
        tool = self.get_tool(tool_name)
        
        if not tool:
            logger.warning(f"[WARN]   Tool no encontrada: {tool_name}")
            return {
                "success": False,
                "data": None,
                "error": f"Tool '{tool_name}' no existe o está deshabilitada",
                "execution_time_ms": 0
            }
        
        logger.info(f"[TOOL]  Ejecutando tool: {tool_name} con params: {params}")
        
        result = await tool.safe_execute(user_role=user_role, **params)
        
        if result["success"]:
            logger.info(f"[SUCCESS]  Tool ejecutada: {tool_name} ({result['execution_time_ms']}ms)")
        else:
            logger.error(f"[ERROR]  Tool falló: {tool_name} - {result['error']}")
        
        return result
    
    async def execute_multiple_tools(
        self,
        tool_calls: List[Dict[str, Any]],
        user_role: Optional[str] = None,
        max_executions: int = None
    ) -> List[Dict[str, Any]]:
        """
        Ejecuta múltiples tools en secuencia.
        
        Args:
            tool_calls: [
                {"tool_name": "...", "arguments": {...}},
                ...
            ]
            user_role: Rol del usuario
            max_executions: Máximo de tools a ejecutar (seguridad)
            
        Returns:
            Lista de resultados
        """
        max_exec = max_executions or settings.MAX_TOOL_EXECUTIONS_PER_REQUEST
        
        if len(tool_calls) > max_exec:
            logger.warning(f"[WARN]   Limitando ejecución a {max_exec} tools")
            tool_calls = tool_calls[:max_exec]
        
        results = []
        
        for call in tool_calls:
            tool_name = call.get("tool_name")
            arguments = call.get("arguments", {})
            
            result = await self.execute_tool(tool_name, arguments, user_role)
            results.append({
                "tool_name": tool_name,
                **result
            })
        
        return results
    
    def tool_exists(self, tool_name: str) -> bool:
        """Verifica si una tool existe"""
        return tool_name in self.tools
    
    def get_tool_info(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """Obtiene información de una tool"""
        tool = self.get_tool(tool_name)
        if tool:
            return {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters,
                "required_permissions": tool.required_permissions
            }
        return None

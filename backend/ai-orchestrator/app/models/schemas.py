"""
Pydantic schemas para request/response
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


# ====================================
# Request Schemas
# ====================================

class ChatRequest(BaseModel):
    """Request para chat de texto simple"""
    message: str = Field(..., description="Mensaje del usuario")
    user_id: str = Field(..., description="ID del usuario")
    conversation_id: Optional[str] = Field(None, description="ID de la conversación")
    context: Optional[Dict[str, Any]] = Field(None, description="Contexto adicional")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Busca arquitectos especializados en diseño moderno en Bogotá",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "conversation_id": "660e8400-e29b-41d4-a716-446655440001",
                "context": {"rol": "cliente"}
            }
        }


class MultimodalRequest(BaseModel):
    """Request para chat multimodal con archivos"""
    message: str
    user_id: str
    conversation_id: Optional[str] = None
    file_type: Optional[str] = None  # image | pdf | audio
    

# ====================================
# Response Schemas
# ====================================

class ToolExecution(BaseModel):
    """Información de una tool ejecutada"""
    tool_name: str
    params: Dict[str, Any]
    result: Optional[Any] = None
    success: bool
    execution_time_ms: float
    

class ChatResponse(BaseModel):
    """Response del chatbot"""
    content: str = Field(..., description="Respuesta del AI")
    user_id: str
    conversation_id: Optional[str] = None
    tools_executed: List[ToolExecution] = Field(default_factory=list)
    llm_provider: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "content": "Encontré 3 arquitectos especializados en diseño moderno...",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "conversation_id": "660e8400-e29b-41d4-a716-446655440001",
                "tools_executed": [
                    {
                        "tool_name": "buscar_arquitectos",
                        "params": {"especialidad": "moderno", "ubicacion": "Bogotá"},
                        "result": {"arquitectos": [...]},
                        "success": True,
                        "execution_time_ms": 245.5
                    }
                ],
                "llm_provider": "gemini",
                "timestamp": "2026-01-15T10:30:00Z"
            }
        }


class MCPToolResponse(BaseModel):
    """Response de ejecución de una tool"""
    tool: str
    success: bool
    result: Optional[Any] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str
    llm_provider: str
    environment: str

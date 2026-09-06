"""
AI Orchestrator - Pilar 3: MCP Chatbot Multimodal
FastAPI server que orquesta interacciones con LLMs y ejecuta MCP Tools
"""

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from typing import Optional, List
import sys

from app.config import settings
from app.orchestrator.ai_orchestrator import AIOrchestrator
from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    MCPToolResponse,
    HealthResponse,
    MultimodalRequest
)
from app.websocket.connection_manager import ConnectionManager


# ====================================
# Lifecycle Events
# ====================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicialización y limpieza del servidor"""
    logger.info("[START]  Iniciando AI Orchestrator...")
    logger.info(f"[ENV]  Entorno: {settings.ENVIRONMENT}")
    logger.info(f"[AI]  LLM Activo: {settings.ACTIVE_LLM_PROVIDER}")
    logger.info(f"[URL]  Rails API: {settings.RAILS_API_URL}")
    logger.info(f"[CONN]  WebSocket: {settings.WEBSOCKET_URL}")
    
    # Inicializar servicios
    app.state.orchestrator = AIOrchestrator()
    app.state.ws_manager = ConnectionManager()
    
    yield
    
    # Cleanup
    logger.info("[STOP]  Cerrando AI Orchestrator...")


# ====================================
# FastAPI App
# ====================================

app = FastAPI(
    title="ArquiPro AI Orchestrator",
    description="Chatbot multimodal con MCP Tools para gestión arquitectónica",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend y Rails
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ====================================
# Health Check
# ====================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-orchestrator",
        "version": "1.0.0",
        "llm_provider": settings.ACTIVE_LLM_PROVIDER,
        "environment": settings.ENVIRONMENT
    }


# ====================================
# Chat Endpoints
# ====================================

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Endpoint principal de chat (solo texto)
    
    Body:
        {
            "message": "Busca arquitectos especializados en diseño moderno",
            "user_id": "uuid",
            "conversation_id": "uuid" (opcional),
            "context": {} (opcional)
        }
    """
    try:
        orchestrator: AIOrchestrator = app.state.orchestrator
        
        response = await orchestrator.process_text_message(
            message=request.message,
            user_id=request.user_id,
            conversation_id=request.conversation_id,
            context=request.context
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error en chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/chat/multimodal", response_model=ChatResponse)
async def chat_multimodal(
    message: str = Form(...),
    user_id: str = Form(...),
    conversation_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Endpoint multimodal: acepta texto + archivo (imagen o PDF)
    
    Form Data:
        - message: Texto del usuario
        - user_id: ID del usuario
        - conversation_id: ID de conversación (opcional)
        - file: Archivo imagen o PDF (opcional)
    """
    try:
        orchestrator: AIOrchestrator = app.state.orchestrator
        
        # Procesar archivo si existe
        file_data = None
        if file:
            file_content = await file.read()
            file_data = {
                "filename": file.filename,
                "content_type": file.content_type,
                "data": file_content
            }
        
        response = await orchestrator.process_multimodal_message(
            message=message,
            user_id=user_id,
            conversation_id=conversation_id,
            file_data=file_data
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error en chat multimodal: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ====================================
# MCP Tools Endpoints (para testing)
# ====================================

@app.get("/api/v1/tools", response_model=List[dict])
async def list_tools():
    """Lista todas las MCP Tools disponibles"""
    orchestrator: AIOrchestrator = app.state.orchestrator
    tools = orchestrator.mcp_server.get_available_tools()
    return tools


@app.post("/api/v1/tools/{tool_name}/execute", response_model=MCPToolResponse)
async def execute_tool(tool_name: str, params: dict):
    """
    Ejecutar una MCP Tool directamente (para testing)
    
    Body:
        {
            "param1": "value1",
            "param2": "value2"
        }
    """
    try:
        orchestrator: AIOrchestrator = app.state.orchestrator
        result = await orchestrator.mcp_server.execute_tool(tool_name, params)
        
        return {
            "tool": tool_name,
            "success": True,
            "result": result,
            "error": None
        }
        
    except Exception as e:
        logger.error(f"Error ejecutando tool {tool_name}: {e}")
        return {
            "tool": tool_name,
            "success": False,
            "result": None,
            "error": str(e)
        }


# ====================================
# WebSocket Real-time Chat
# ====================================

@app.websocket("/ws/chat/{user_id}")
async def websocket_chat(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint para chat en tiempo real
    
    Client envía:
        {
            "type": "message",
            "content": "texto del mensaje",
            "conversation_id": "uuid"
        }
    
    Server responde:
        {
            "type": "response",
            "content": "respuesta del AI",
            "tools_executed": [...],
            "timestamp": "ISO8601"
        }
    """
    ws_manager: ConnectionManager = app.state.ws_manager
    orchestrator: AIOrchestrator = app.state.orchestrator
    
    await ws_manager.connect(websocket, user_id)
    logger.info(f"WebSocket conectado: user_id={user_id}")
    
    try:
        while True:
            # Recibir mensaje del cliente
            data = await websocket.receive_json()
            
            if data.get("type") == "message":
                message = data.get("content")
                conversation_id = data.get("conversation_id")
                context = data.get("context", {})  # Obtener contexto con rol
                
                # Procesar con AI Orchestrator
                response = await orchestrator.process_text_message(
                    message=message,
                    user_id=user_id,
                    conversation_id=conversation_id,
                    context=context  # Pasar el contexto
                )
                
                # Enviar respuesta
                await ws_manager.send_personal_message(
                    {
                        "type": "response",
                        "content": response.content,
                        "tools_executed": [tool.dict() for tool in response.tools_executed],
                        "timestamp": response.timestamp
                    },
                    user_id
                )
                
    except WebSocketDisconnect:
        ws_manager.disconnect(user_id)
        logger.info(f"WebSocket desconectado: user_id={user_id}")
    except Exception as e:
        logger.error(f"Error en WebSocket: {e}")
        ws_manager.disconnect(user_id)


# ====================================
# Error Handlers
# ====================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )


# ====================================
# Entry Point
# ====================================

if __name__ == "__main__":
    import uvicorn
    
    # Configurar logging
    logger.remove()
    logger.add(
        sys.stdout,
        colorize=True,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>"
    )
    
    if settings.LOG_FILE:
        logger.add(
            settings.LOG_FILE,
            rotation=settings.LOG_ROTATION,
            retention="7 days"
        )
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )

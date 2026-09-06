"""
Configuration settings using Pydantic
"""

from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # LLM Providers
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-pro"
    
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-3-sonnet-20240229"
    
    # Groq (API GRATIS ultrarrápida)
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    
    ACTIVE_LLM_PROVIDER: str = "groq"  # openai | gemini | claude | groq
    
    # External Services
    RAILS_API_URL: str = "http://localhost:3000/api/v1"
    RAILS_API_KEY: Optional[str] = None
    
    WEBSOCKET_URL: str = "http://localhost:3006"
    WEBSOCKET_NAMESPACE: str = "/chat"
    
    GRAPHQL_URL: str = "http://localhost:8000/graphql"
    
    # Multimodal
    OCR_ENGINE: str = "tesseract"  # tesseract | google_vision
    TESSERACT_CMD: str = "tesseract"  # Path to tesseract executable
    
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_IMAGE_TYPES: str = "jpg,jpeg,png,webp"
    ALLOWED_PDF_TYPES: str = "pdf"
    
    # MCP Tools (solo 4 principales para optimizar tokens)
    ENABLED_TOOLS: str = "buscar_arquitectos,crear_solicitud,estadisticas_arquitecto,listar_proyectos"
    MAX_REQUESTS_PER_USER_PER_MINUTE: int = 10
    MAX_TOOL_EXECUTIONS_PER_REQUEST: int = 5
    
    # Security
    ALLOWED_ROLES_CREATE: str = "cliente,moderador"
    ALLOWED_ROLES_READ: str = "cliente,arquitecto,moderador"
    ALLOWED_ROLES_UPDATE: str = "arquitecto,moderador"
    ALLOWED_ROLES_DELETE: str = "moderador"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: Optional[str] = "logs/ai-orchestrator.log"
    LOG_ROTATION: str = "10 MB"
    
    # Caching
    CACHE_ENABLED: bool = True
    CACHE_TTL_SECONDS: int = 300
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def enabled_tools_list(self) -> List[str]:
        return [tool.strip() for tool in self.ENABLED_TOOLS.split(",")]
    
    @property
    def allowed_image_types_list(self) -> List[str]:
        return [ext.strip() for ext in self.ALLOWED_IMAGE_TYPES.split(",")]


settings = Settings()

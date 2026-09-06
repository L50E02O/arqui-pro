"""
Tipos para historial de conversación.
"""
import strawberry
from typing import List
from adapters.schemas.arquitecto_schema import ArquitectoType
from adapters.schemas.usuario_schema import UsuarioType
from adapters.schemas.cliente_schema import ClienteType
from adapters.schemas.conversacion_schema import ConversacionType
from adapters.schemas.mensaje_schema import MensajeType


@strawberry.type
class HistorialConversacion:
    """Historial completo de una conversación con participantes y mensajes"""
    conversacion: ConversacionType
    cliente: ClienteType
    cliente_usuario: UsuarioType
    arquitecto: ArquitectoType
    arquitecto_usuario: UsuarioType
    mensajes: List[MensajeType]
    total_mensajes: int
    mensajes_no_leidos: int

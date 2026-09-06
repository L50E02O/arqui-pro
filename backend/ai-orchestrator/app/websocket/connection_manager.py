"""
WebSocket Connection Manager
Gestiona conexiones WebSocket para chat en tiempo real
"""

from fastapi import WebSocket
from typing import Dict, Any
from loguru import logger
import json


class ConnectionManager:
    """
    Gestiona conexiones WebSocket de usuarios.
    Permite enviar mensajes personalizados o broadcasts.
    """
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Acepta y registra una nueva conexión"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"[CONN]  Usuario conectado: {user_id} (total: {len(self.active_connections)})")
    
    def disconnect(self, user_id: str):
        """Desconecta y remueve un usuario"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"[CONN]  Usuario desconectado: {user_id} (quedan: {len(self.active_connections)})")
    
    async def send_personal_message(self, message: Dict[str, Any], user_id: str):
        """Envía mensaje a un usuario específico"""
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_json(message)
                logger.debug(f"[SEND]  Mensaje enviado a {user_id}")
            except Exception as e:
                logger.error(f"Error enviando mensaje a {user_id}: {e}")
                self.disconnect(user_id)
    
    async def broadcast(self, message: Dict[str, Any]):
        """Envía mensaje a todos los usuarios conectados"""
        disconnected = []
        
        for user_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error en broadcast a {user_id}: {e}")
                disconnected.append(user_id)
        
        # Limpiar conexiones fallidas
        for user_id in disconnected:
            self.disconnect(user_id)
    
    def is_connected(self, user_id: str) -> bool:
        """Verifica si un usuario está conectado"""
        return user_id in self.active_connections
    
    def get_connected_users(self) -> list:
        """Retorna lista de user_ids conectados"""
        return list(self.active_connections.keys())

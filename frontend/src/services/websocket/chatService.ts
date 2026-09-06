import { io, Socket } from "socket.io-client";
import { logger } from "../../utils/logger";
import type { Mensaje } from "../../types/mensaje.types";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3006";

class ChatService {
  private socket: Socket | null = null;
  private currentConversationId: string | null = null;
  private messageHandlers: Map<string, Set<(message: Mensaje) => void>> = new Map(); // conversacionId -> handlers
  private globalMessageHandlers: Set<(message: Mensaje) => void> = new Set(); // Handlers globales para todas las conversaciones
  private typingHandlers: Set<(data: { usuarioId: string; isTyping: boolean }) => void> = new Set();
  private connectionHandlers: Set<(connected: boolean) => void> = new Set();

  connect(_usuarioId?: string) {
    if (this.socket?.connected) {
      logger.info("Chat ya está conectado");
      return;
    }

    // Obtener token de autenticación
    const token = localStorage.getItem('auth_token');
    
    // 🔧 CAMBIO: Conectarse al namespace /mensajes en lugar de /chat
    // Este namespace tiene la lógica correcta para filtrar mensajes por room
    this.socket = io(`${WS_URL}/mensajes`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      extraHeaders: token ? {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
      } : {},
    });

    this.socket.on("connect", () => {
      logger.info("✅ Conectado al servidor de chat. Socket ID:", this.socket?.id);
      this.connectionHandlers.forEach((handler) => handler(true));
    });

    this.socket.on("disconnect", (reason) => {
      logger.warn("❌ Desconectado del servidor de chat. Razón:", reason);
      this.connectionHandlers.forEach((handler) => handler(false));
    });

    this.socket.on("connect_error", (error) => {
      logger.error("❌ Error de conexión:", error.message);
    });

    this.socket.on("connection:established", (data) => {
      logger.info("Conexión establecida:", data);
    });

    this.socket.on("conversation:joined", (data) => {
      logger.info("✅ Unido a conversación:", data);
      // El servidor puede enviar mensajes previos en data.mensajes
      if (data.mensajes && Array.isArray(data.mensajes)) {
        data.mensajes.forEach((mensaje: any) => {
          const handlers = this.messageHandlers.get(mensaje.conversacion_id);
          if (handlers) {
            handlers.forEach((handler) => handler(mensaje));
          }
        });
      }
    });

    this.socket.on("conversation:left", (data) => {
      logger.info("👋 Salió de conversación:", data);
    });

    this.socket.on("message:new", (message: Mensaje) => {
      logger.info("📩 Nuevo mensaje recibido:", message);
      logger.info("📩 conversacion_id del mensaje:", message.conversacion_id);
      logger.info("📩 Mensaje completo:", JSON.stringify(message, null, 2));
      
      // Notificar a los handlers globales (para bandeja de notificaciones)
      this.globalMessageHandlers.forEach((handler) => {
        handler(message);
      });
      
      // Solo llamar a los handlers de la conversación correspondiente
      const handlers = this.messageHandlers.get(message.conversacion_id);
      if (handlers) {
        logger.info(`📩 Ejecutando ${handlers.size} handlers para conversación ${message.conversacion_id}`);
        handlers.forEach((handler) => {
          handler(message);
        });
      } else {
        logger.warn(`⚠️ No hay handlers registrados para conversación ${message.conversacion_id}`);
      }
    });

    this.socket.on("message:typing", (data: { usuario_id: string; conversacion_id: string; typing: boolean }) => {
      logger.info("✍️ Usuario escribiendo:", data);
      // Convertir formato del backend al formato esperado por el frontend
      this.typingHandlers.forEach((handler) => handler({
        usuarioId: data.usuario_id,
        isTyping: data.typing
      }));
    });

    this.socket.on("error", (error: any) => {
      logger.error("Error en chat socket:", error);
      logger.error("Detalles del error:", {
        message: error?.message,
        details: error?.details,
        status: error?.status
      });
      // Notificar a los handlers de conexión sobre el error
      this.connectionHandlers.forEach((handler) => handler(false));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentConversationId = null;
      logger.info("Desconectado del chat");
    }
  }

  joinConversation(conversationId: string) {
    if (!this.socket?.connected) {
      logger.error("Socket no conectado. Llamar connect() primero");
      return;
    }

    this.currentConversationId = conversationId;
    logger.info(`👥 Intentando unirse a conversación ${conversationId}`);
    this.socket.emit("join_conversation", { conversacion_id: conversationId }, (response: any) => {
      logger.info(`👥 Respuesta del servidor al unirse:`, response);
    });
    logger.info(`👥 Emitido join_conversation para ${conversationId}`);
  }

  leaveConversation(conversationId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit("leave_conversation", { conversacion_id: conversationId });
    this.currentConversationId = null;
    logger.info(`👋 Salió de conversación ${conversationId}`);
  }

  sendMessage(contenido: string, usuarioId: string, conversacionId: string, imagenes?: string[]) {
    if (!this.socket) {
      logger.error("Socket no inicializado. Llamar connect() primero");
      throw new Error("Socket no inicializado");
    }

    if (!this.socket.connected) {
      logger.error("Socket no conectado. Estado:", {
        connected: this.socket.connected,
        disconnected: this.socket.disconnected,
        id: this.socket.id
      });
      // Intentar reconectar
      logger.info("Intentando reconectar...");
      this.socket.connect();
      // Esperar un momento y reintentar
      setTimeout(() => {
        if (this.socket?.connected) {
          this.socket.emit("message:create", {
            conversacion_id: conversacionId,
            emisor_id: usuarioId,
            contenido: contenido,
            tipo: imagenes && imagenes.length > 0 ? "imagen" : "texto",
            imagenes: imagenes || []
          }, (response: any) => {
            if (response?.status === 'error') {
              logger.error("Error del servidor al crear mensaje:", response.error);
            } else {
              logger.info("📤 Mensaje enviado después de reconectar:", { conversacionId, usuarioId, contenido });
            }
          });
        } else {
          logger.error("No se pudo reconectar. Mensaje no enviado.");
        }
      }, 500);
      return;
    }

    logger.info("📤 Enviando mensaje:", { conversacionId, usuarioId, contenido, imagenes: imagenes?.length || 0 });
    this.socket.emit("message:create", {
      conversacion_id: conversacionId,
      emisor_id: usuarioId,
      contenido: contenido,
      tipo: imagenes && imagenes.length > 0 ? "imagen" : "texto",
      imagenes: imagenes || []
    }, (response: any) => {
      if (response?.status === 'error') {
        logger.error("❌ Error del servidor al crear mensaje:", response.error);
        logger.error("❌ Detalles:", response);
      } else {
        logger.info("✅ Respuesta del servidor:", response);
      }
    });

    logger.info("📤 Mensaje emitido al servidor:", { conversacionId, usuarioId, contenido, imagenes: imagenes?.length || 0 });
  }

  notifyTyping(conversacionId: string, usuarioId: string, isTyping: boolean) {
    if (!this.socket?.connected) return;

    this.socket.emit("message:typing", {
      conversacion_id: conversacionId,
      usuario_id: usuarioId,
      typing: isTyping,
    });
  }

  onMessage(conversacionId: string, handler: (message: Mensaje) => void) {
    logger.info(`📝 Registrando handler de mensajes para conversación: ${conversacionId}`);
    
    if (!this.messageHandlers.has(conversacionId)) {
      this.messageHandlers.set(conversacionId, new Set());
    }
    
    const handlers = this.messageHandlers.get(conversacionId)!;
    handlers.add(handler);
    
    logger.info(`📊 Total handlers para conversación ${conversacionId}: ${handlers.size}`);
    
    return () => {
      logger.info(`🗑️ Eliminando handler para conversación: ${conversacionId}`);
      const handlers = this.messageHandlers.get(conversacionId);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(conversacionId);
          logger.info(`🧹 Limpiados todos los handlers de conversación: ${conversacionId}`);
        }
      }
    };
  }

  onGlobalMessage(handler: (message: Mensaje) => void) {
    logger.info(`📝 Registrando handler global de mensajes`);
    this.globalMessageHandlers.add(handler);
    
    return () => {
      logger.info(`🗑️ Eliminando handler global de mensajes`);
      this.globalMessageHandlers.delete(handler);
    };
  }

  onTyping(handler: (data: { usuarioId: string; isTyping: boolean }) => void) {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  onConnectionChange(handler: (connected: boolean) => void) {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  isConnected(): boolean {
    const connected = this.socket?.connected || false;
    if (!connected && this.socket) {
      logger.warn("Socket existe pero no está conectado. Estado:", {
        connected: this.socket.connected,
        disconnected: this.socket.disconnected,
        id: this.socket.id
      });
    }
    return connected;
  }

  get currentConversation(): string | null {
    return this.currentConversationId;
  }
}

export const chatService = new ChatService();

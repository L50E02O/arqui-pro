import { io, Socket } from "socket.io-client";
import { logger } from "../../utils/logger";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3006";

interface Notification {
  id: string;
  type: "nuevaConversacion" | "message:new" | "proyecto:creado" | "arquitecto:verificado" | "generic";
  data: any;
  timestamp: Date;
  read: boolean;
}

class NotificationService {
  private socket: Socket | null = null;
  private notifications: Notification[] = [];
  private notificationHandlers: Set<(notification: Notification) => void> = new Set();

  connect() {
    if (this.socket?.connected) {
      logger.info("Notificaciones ya conectadas");
      return;
    }

    // Solicitar permiso para notificaciones del navegador
    this.requestPermission();

    // Obtener token de autenticación
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    this.socket = io(`${WS_URL}/notificacion`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      extraHeaders: token ? {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
      } : {},
    });

    this.socket.on("connect", () => {
      logger.info("✅ Conectado al servidor de notificaciones");
      
      // Registrar el usuario en el servidor WebSocket
      if (user && user.id) {
        this.socket?.emit('register_user', { usuario_id: user.id });
        logger.info(`📝 Usuario ${user.id} registrado en notificaciones`);
      }
    });

    this.socket.on("disconnect", () => {
      logger.warn("❌ Desconectado del servidor de notificaciones");
    });

    // ========================================
    // EVENTO: Nueva notificación genérica
    // ========================================
    this.socket.on("nueva_notificacion", (data) => {
      logger.info("📬 Nueva notificación recibida:", data);
      const notification: Notification = {
        id: data.id || `notif-${Date.now()}`,
        type: "generic",
        data,
        timestamp: new Date(data.fecha || Date.now()),
        read: false,
      };
      this.addNotification(notification);
      this.showBrowserNotification("Nueva notificación", data.mensaje);
    });

    this.socket.on("nuevaConversacion", (data) => {
      const notification: Notification = {
        id: `conv-${Date.now()}`,
        type: "nuevaConversacion",
        data,
        timestamp: new Date(),
        read: false,
      };
      this.addNotification(notification);
    });

    // Escuchar cuando se crea una nueva conversación
    this.socket.on("conversacion:creada", (data) => {
      const notification: Notification = {
        id: `conv-${Date.now()}`,
        type: "nuevaConversacion",
        data,
        timestamp: new Date(),
        read: false,
      };
      this.addNotification(notification);
    });

    this.socket.on("message:new", (data) => {
      const notification: Notification = {
        id: `msg-${Date.now()}`,
        type: "message:new",
        data,
        timestamp: new Date(),
        read: false,
      };
      this.addNotification(notification);
    });

    // Escuchar cuando un arquitecto crea un proyecto para un cliente
    this.socket.on("proyecto:creado", (data) => {
      logger.info("📬 Proyecto creado:", data);
      const notification: Notification = {
        id: `proyecto-${Date.now()}`,
        type: "proyecto:creado",
        data,
        timestamp: new Date(),
        read: false,
      };
      this.addNotification(notification);
      this.showBrowserNotification("Nuevo Proyecto", data.mensaje || "Se ha creado un nuevo proyecto");
    });

    // Escuchar cuando un arquitecto es verificado
    this.socket.on("arquitecto_verificado", (data) => {
      logger.info("📬 Arquitecto verificado:", data);
      const notification: Notification = {
        id: `verif-${Date.now()}`,
        type: "arquitecto:verificado",
        data,
        timestamp: new Date(),
        read: false,
      };
      this.addNotification(notification);
    });

    // Escuchar cuando un arquitecto es rechazado
    this.socket.on("arquitecto:rechazado", (data) => {
      const notification: Notification = {
        id: `rech-${Date.now()}`,
        type: "arquitecto:verificado",
        data,
        timestamp: new Date(),
        read: false,
      };
      this.addNotification(notification);
    });

    // Escuchar notificaciones genéricas
    this.socket.on("notificacion", (data) => {
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        type: "generic",
        data,
        timestamp: new Date(),
        read: false,
      };
      this.addNotification(notification);
    });

    this.socket.on("error", (error) => {
      logger.error("Error en notificaciones socket:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      logger.info("Desconectado de notificaciones");
    }
  }

  private addNotification(notification: Notification) {
    this.notifications.unshift(notification);
    logger.info("🔔 Nueva notificación:", notification);
    this.notificationHandlers.forEach((handler) => handler(notification));
  }

  onNotification(handler: (notification: Notification) => void) {
    this.notificationHandlers.add(handler);
    return () => this.notificationHandlers.delete(handler);
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  markAsRead(id: string) {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  markAllAsRead() {
    this.notifications.forEach((n) => (n.read = true));
  }

  clearNotifications() {
    this.notifications = [];
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  // Solicitar permiso para notificaciones del navegador
  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        logger.info('Permiso de notificaciones:', permission);
      } catch (error) {
        logger.error('Error solicitando permiso de notificaciones:', error);
      }
    }
  }

  // Mostrar notificación del navegador
  showBrowserNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/logo.png', // Asegúrate de tener un logo en public/
          badge: '/logo.png',
        });
      } catch (error) {
        logger.error('Error mostrando notificación del navegador:', error);
      }
    }
  }
}

export const notificationService = new NotificationService();

import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { logger } from '../utils/logger';
import notificacionesService from '../services/api/notificacionesService';

export interface Notificacion {
  id: string;
  tipo: 'mensaje' | 'conversacion' | 'sistema';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  metadata?: any;
}

interface UseNotificationsOptions {
  usuarioId: string;
  autoConnect?: boolean;
}

interface UseNotificationsReturn {
  notificaciones: Notificacion[];
  isConnected: boolean;
  markAsRead: (notificacionId: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

export function useNotifications({ 
  usuarioId, 
  autoConnect = true 
}: UseNotificationsOptions): UseNotificationsReturn {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Conectar al servidor de notificaciones
  useEffect(() => {
    if (!autoConnect || !usuarioId) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3006';
    const token = localStorage.getItem('auth_token');

    logger.info('Conectando a Notificaciones WebSocket', { wsUrl, usuarioId });

    const newSocket = io(`${wsUrl}/notificacion`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
      extraHeaders: token ? {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
      } : {},
    });

    // Evento: Conexión exitosa
    newSocket.on('connected', (data) => {
      logger.info('Notificaciones WebSocket conectado', data);
      setIsConnected(true);
    });

    newSocket.on('connect', () => {
      logger.info('Notificaciones WebSocket connect event');
      setIsConnected(true);
    });

    // Evento: Desconexión
    newSocket.on('disconnect', (reason) => {
      logger.warn('Notificaciones WebSocket desconectado', { reason });
      setIsConnected(false);
    });

    // Evento: Error de conexión
    newSocket.on('connect_error', (error) => {
      logger.error('Error de conexión Notificaciones WebSocket', error);
      setIsConnected(false);
    });

    // Evento: Nueva conversación
    newSocket.on('nuevaConversacion', (conversacion: any) => {
      logger.info('Nueva conversación recibida', conversacion);
      
      const notificacion: Notificacion = {
        id: `conv-${Date.now()}`,
        tipo: 'conversacion',
        titulo: 'Nueva Conversación',
        mensaje: `Tienes una nueva conversación`,
        fecha: new Date().toISOString(),
        leida: false,
        metadata: conversacion
      };
      
      setNotificaciones(prev => [notificacion, ...prev]);
    });

    // Evento: Nuevo mensaje (desde el gateway de chat)
    newSocket.on('message:new', (mensaje: any) => {
      logger.info('Nuevo mensaje recibido en notificaciones', mensaje);
      
      const notificacion: Notificacion = {
        id: `msg-${mensaje.id || Date.now()}`,
        tipo: 'mensaje',
        titulo: 'Nuevo Mensaje',
        mensaje: mensaje.contenido || 'Tienes un nuevo mensaje',
        fecha: mensaje.fecha_envio || new Date().toISOString(),
        leida: false,
        metadata: mensaje
      };
      
      setNotificaciones(prev => [notificacion, ...prev]);
    });

    return () => {
      logger.info('Desconectando Notificaciones WebSocket');
      newSocket.disconnect();
    };
  }, [autoConnect, usuarioId]);

  // Marcar notificación como leída
  const markAsRead = useCallback(async (notificacionId: string) => {
    try {
      // Actualizar en el backend si el ID corresponde a una notificación real (no generada localmente)
      if (!notificacionId.startsWith('msg-') && !notificacionId.startsWith('conv-')) {
        await notificacionesService.marcarComoLeida(notificacionId)
      }
      
      // Actualizar en el estado local
      setNotificaciones(prev => 
        prev.map(n => 
          n.id === notificacionId ? { ...n, leida: true } : n
        )
      );
    } catch (error) {
      logger.error('Error al marcar notificación como leída', error)
    }
  }, []);

  // Limpiar todas las notificaciones
  const clearAll = useCallback(() => {
    setNotificaciones([]);
  }, []);

  // Contar notificaciones no leídas
  const unreadCount = notificaciones.filter(n => !n.leida).length;

  return {
    notificaciones,
    isConnected,
    markAsRead,
    clearAll,
    unreadCount
  };
}

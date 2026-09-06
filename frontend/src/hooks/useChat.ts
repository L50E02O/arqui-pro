import { useEffect, useState, useCallback } from 'react';
import { chatService } from '../services/websocket/chatService';
import { useMensajes } from './useApiWithCache';
import type { Mensaje } from '../types/mensaje.types';
import { logger } from '../utils/logger';
import { notificationService } from '../services/notificationService';

interface UseChatOptions {
  conversacionId: string;
  usuarioId: string;
  autoConnect?: boolean;
}

interface UseChatReturn {
  mensajes: Mensaje[];
  isConnected: boolean;
  isTyping: boolean;
  sendMessage: (contenido: string, imagenes?: string[]) => void;
  notifyTyping: (isTyping: boolean) => void;
  addMensaje: (mensaje: Mensaje) => void;
}

export function useChat({ 
  conversacionId, 
  usuarioId, 
  autoConnect = true 
}: UseChatOptions): UseChatReturn {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Bandera para carga inicial
  
  // Limpiar mensajes cuando cambia la conversación
  useEffect(() => {
    logger.info(`🔄 Conversación cambiada a: ${conversacionId} - Limpiando mensajes anteriores`);
    setMensajes([]);
    setIsTyping(false);
    setIsInitialLoad(true); // Resetear bandera al cambiar conversación
  }, [conversacionId]);
  
  // Cargar mensajes existentes desde la API
  const { data: mensajesData, loading: loadingMensajes } = useMensajes(conversacionId);

  // Conectar al chat
  useEffect(() => {
    if (!autoConnect || !usuarioId) return;

    logger.info('Inicializando chat', { conversacionId, usuarioId });
    chatService.connect(usuarioId);
    
    // Verificar conexión inmediatamente y luego periódicamente
    const checkConnection = () => {
      const connected = chatService.isConnected();
      setIsConnected(connected);
      if (!connected) {
        logger.warn('Chat no conectado, reintentando...');
      }
    };
    
    // Verificar inmediatamente
    checkConnection();
    
    // Verificar cada segundo
    const interval = setInterval(checkConnection, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [autoConnect, usuarioId]);

  // Cargar mensajes existentes cuando se cargan desde la API
  useEffect(() => {
    if (mensajesData && Array.isArray(mensajesData)) {
      logger.info(`🔍 Cargando mensajes desde API para conversación: ${conversacionId}`);
      logger.info(`📊 Total mensajes recibidos de API: ${mensajesData.length}`);
      
      // ⚠️ FILTRAR CRÍTICO: Solo mensajes de ESTA conversación
      const mensajesFiltrados = mensajesData.filter(m => {
        const perteneceAConversacion = m.conversacion_id === conversacionId;
        if (!perteneceAConversacion) {
          logger.warn(`❌ Mensaje ${m.id} ignorado - pertenece a conversación ${m.conversacion_id}, esperando ${conversacionId}`);
        }
        return perteneceAConversacion;
      });
      
      logger.info(`✅ Mensajes filtrados para conversación ${conversacionId}: ${mensajesFiltrados.length}`);
      
      // Ordenar mensajes por fecha_envio
      const mensajesOrdenados = [...mensajesFiltrados].sort((a, b) => {
        const fechaA = new Date(a.fecha_envio).getTime();
        const fechaB = new Date(b.fecha_envio).getTime();
        return fechaA - fechaB;
      });
      setMensajes(mensajesOrdenados);
      
      // Marcar que la carga inicial terminó después de un pequeño delay
      setTimeout(() => {
        setIsInitialLoad(false);
        logger.info('✅ Carga inicial completada, ahora se mostrarán notificaciones para mensajes nuevos');
      }, 500);
    } else if (mensajesData === null && !loadingMensajes) {
      // Si no hay mensajes y ya terminó de cargar, dejar el array vacío
      logger.info(`📭 No hay mensajes para conversación ${conversacionId}`);
      setMensajes([]);
      setTimeout(() => setIsInitialLoad(false), 500);
    }
  }, [mensajesData, loadingMensajes, conversacionId]);

  // Unirse a la conversación
  useEffect(() => {
    if (!conversacionId || !chatService.isConnected()) {
      // Si no está conectado, intentar reconectar
      if (conversacionId && usuarioId) {
        logger.info('Esperando conexión para unirse a conversación', { conversacionId });
        const checkAndJoin = setInterval(() => {
          if (chatService.isConnected()) {
            logger.info('Conexión establecida, uniéndose a conversación', { conversacionId });
            chatService.joinConversation(conversacionId);
            clearInterval(checkAndJoin);
          }
        }, 500);
        
        return () => {
          clearInterval(checkAndJoin);
        };
      }
      return;
    }

    logger.info('Uniéndose a conversación', { conversacionId });
    chatService.joinConversation(conversacionId);

    return () => {
      logger.info('Saliendo de conversación', { conversacionId });
      chatService.leaveConversation(conversacionId);
    };
  }, [conversacionId, isConnected]);

  // Escuchar nuevos mensajes
  useEffect(() => {
    logger.info('Registrando handler de mensajes en useChat para conversación:', conversacionId);
    const unsubscribe = chatService.onMessage(conversacionId, (mensaje: Mensaje) => {
      logger.info('Nuevo mensaje en hook para conversación:', conversacionId);
      logger.info('Mensaje recibido:', mensaje);
      
      // Ya no necesitamos filtrar aquí porque el servicio lo hace
      // Pero lo dejamos por seguridad
      if (mensaje.conversacion_id !== conversacionId) {
        logger.warn(`⚠️ ALERTA: Mensaje de conversación ${mensaje.conversacion_id} llegó al handler de ${conversacionId}`);
        return;
      }
      
      logger.info('Mensaje aceptado - pertenece a esta conversación');
      
      // 🔔 NOTIFICACIÓN: Solo si NO es carga inicial Y el mensaje NO es del usuario actual
      if (!isInitialLoad && mensaje.remitente_id !== usuarioId) {
        const senderName = mensaje.remitente?.nombre || 'Usuario';
        logger.info(`🔔 Mostrando notificación para mensaje de ${senderName}`);
        notificationService.notifyNewMessage(senderName, mensaje.contenido, conversacionId);
        notificationService.showToast(`Nuevo mensaje de ${senderName}`, 'info');
      } else if (isInitialLoad) {
        logger.info('🔇 Notificación silenciada (carga inicial de mensajes)');
      }
      
      setMensajes(prev => {
        // ✅ SOLUCIÓN DUPLICADOS: Si el mensaje es MÍO, buscar y reemplazar el optimista
        if (mensaje.remitente_id === usuarioId) {
          logger.info('Mensaje propio recibido del servidor:', mensaje.id);
          
          // Buscar mensaje optimista pendiente (temp-*)
          const indexOptimista = prev.findIndex(m => 
            m.id.startsWith('temp-') && 
            m.contenido === mensaje.contenido &&
            m.remitente_id === mensaje.remitente_id
          );
          
          if (indexOptimista !== -1) {
            logger.info('✅ Reemplazando mensaje optimista con mensaje real del servidor');
            const nuevosMensajes = [...prev];
            nuevosMensajes[indexOptimista] = mensaje;
            return nuevosMensajes.sort((a, b) => {
              const fechaA = new Date(a.fecha_envio).getTime();
              const fechaB = new Date(b.fecha_envio).getTime();
              return fechaA - fechaB;
            });
          }
          
          // Si no hay mensaje optimista, verificar si ya existe por ID
          if (prev.some(m => m.id === mensaje.id)) {
            logger.info('⚠️ Mensaje propio ya existe (duplicado), ignorando');
            return prev;
          }
          
          logger.info('✅ Agregando mensaje propio del servidor (no había optimista)');
        }
        
        // Para mensajes de OTROS usuarios
        if (mensaje.remitente_id !== usuarioId) {
          // Verificar duplicados por ID
          if (prev.some(m => m.id === mensaje.id)) {
            logger.info('Mensaje de otro usuario ya existe (duplicado), ignorando:', mensaje.id);
            return prev;
          }
        }
        
        logger.info(`Agregando nuevo mensaje. Total anterior: ${prev.length}, Nuevo total: ${prev.length + 1}`);
        // Agregar el mensaje y ordenar por fecha
        const nuevosMensajes = [...prev, mensaje].sort((a, b) => {
          const fechaA = new Date(a.fecha_envio).getTime();
          const fechaB = new Date(b.fecha_envio).getTime();
          return fechaA - fechaB;
        });
        return nuevosMensajes;
      });
    });

    return () => {
      logger.info('Desregistrando handler de mensajes');
      unsubscribe();
    };
  }, [conversacionId, usuarioId]); // Agregar usuarioId como dependencia

  // Escuchar eventos de escritura
  useEffect(() => {
    const unsubscribe = chatService.onTyping(({ usuarioId: typingUserId, isTyping }: { usuarioId: string; isTyping: boolean }) => {
      // Solo mostrar si es otro usuario
      if (typingUserId !== usuarioId) {
        setIsTyping(isTyping);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [usuarioId]);

  // Enviar mensaje
  const sendMessage = useCallback((contenido: string, imagenes?: string[]) => {
    // Permitir envío si hay contenido O imágenes
    if (!contenido.trim() && (!imagenes || imagenes.length === 0)) return;

    // Optimistic update: agregar el mensaje inmediatamente
    const mensajeOptimistic: Mensaje = {
      id: `temp-${Date.now()}`,
      contenido: contenido.trim(),
      fecha_envio: new Date().toISOString(),
      leido: false,
      remitente_id: usuarioId,
      conversacion_id: conversacionId,
      imagenes: imagenes?.map((url, index) => ({
        id: `temp-img-${index}`,
        imagen_url: url,
        fecha: new Date().toISOString()
      })) || []
    };
    
    logger.info('Agregando mensaje optimista:', mensajeOptimistic);
    setMensajes(prev => {
      // Evitar duplicados
      if (prev.some(m => m.id === mensajeOptimistic.id)) {
        return prev;
      }
      return [...prev, mensajeOptimistic].sort((a, b) => {
        const fechaA = new Date(a.fecha_envio).getTime();
        const fechaB = new Date(b.fecha_envio).getTime();
        return fechaA - fechaB;
      });
    });

    try {
      chatService.sendMessage(contenido, usuarioId, conversacionId, imagenes);
      logger.info('Mensaje enviado exitosamente al servidor');
      
      // El mensaje optimista se mantendrá hasta que llegue el mensaje real del servidor
      // Si hay un error, el servidor emitirá un evento 'error' que será manejado
    } catch (error) {
      logger.error('Error al enviar mensaje', error);
      // Remover el mensaje optimista si falla
      setMensajes(prev => prev.filter(m => m.id !== mensajeOptimistic.id));
    }
  }, [conversacionId, usuarioId]);

  // Notificar que está escribiendo
  const notifyTyping = useCallback((typing: boolean) => {
    chatService.notifyTyping(conversacionId, usuarioId, typing);
  }, [conversacionId, usuarioId]);

  // Agregar mensaje manualmente (para mensajes cargados desde API)
  const addMensaje = useCallback((mensaje: Mensaje) => {
    setMensajes(prev => {
      // Evitar duplicados
      if (prev.some(m => m.id === mensaje.id)) {
        return prev;
      }
      return [...prev, mensaje];
    });
  }, []);

  return {
    mensajes,
    isConnected,
    isTyping,
    sendMessage,
    notifyTyping,
    addMensaje,
  };
}

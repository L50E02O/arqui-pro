import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3006/verificaciones';

interface UseVerificacionesOptions {
  autoConnect?: boolean;
}

export const useVerificaciones = (options: UseVerificacionesOptions = {}) => {
  const { autoConnect = true } = options;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [arquitectosVerificados, setArquitectosVerificados] = useState(0);

  // Callback para verificacion aprobada
  const handleVerificacionAprobada = useCallback((data: any) => {
    console.log('[Verificaciones] Arquitecto verificado:', data);
    setArquitectosVerificados(prev => prev + 1);
  }, []);

  // Callback para nueva verificacion
  const handleNuevaVerificacion = useCallback((data: any) => {
    console.log('[Verificaciones] Nueva verificacion:', data);
    setArquitectosVerificados(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!autoConnect) return;

    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[Verificaciones] Conectado al namespace /verificaciones');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Verificaciones] Desconectado del namespace /verificaciones');
      setIsConnected(false);
    });

    // Escuchar eventos
    socketInstance.on('verificacion:aprobada', handleVerificacionAprobada);
    socketInstance.on('verificacion:nueva_verificacion', handleNuevaVerificacion);

    setSocket(socketInstance);

    return () => {
      socketInstance.off('verificacion:aprobada', handleVerificacionAprobada);
      socketInstance.off('verificacion:nueva_verificacion', handleNuevaVerificacion);
      socketInstance.disconnect();
    };
  }, [autoConnect, handleVerificacionAprobada, handleNuevaVerificacion]);

  return {
    socket,
    isConnected,
    arquitectosVerificados,
    setArquitectosVerificados,
  };
};

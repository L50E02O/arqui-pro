import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Incidencia } from '../types/incidencia.types';

const SOCKET_URL = 'http://localhost:3006/incidencias';

interface UseIncidenciasOptions {
  usuarioId?: string;
  incidenciaId?: string;
  esModerador?: boolean;
  autoConnect?: boolean;
}

export const useIncidencias = (options: UseIncidenciasOptions = {}) => {
  const { usuarioId, incidenciaId, esModerador = false, autoConnect = true } = options;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Callback para nueva incidencia
  const handleNuevaIncidencia = useCallback((incidencia: Incidencia) => {
    setIncidencias((prev) => {
      if (prev.some((i) => i.id === incidencia.id)) {
        return prev;
      }
      return [incidencia, ...prev];
    });
  }, []);

  // Callback para estado cambiado
  const handleEstadoCambiado = useCallback((data: { incidencia_id: string; estado: string }) => {
    setIncidencias((prev) =>
      prev.map((i) => (i.id === data.incidencia_id ? { ...i, estado: data.estado as Incidencia['estado'] } : i))
    );
  }, []);

  // Callback para incidencia asignada
  const handleIncidenciaAsignada = useCallback((data: { incidencia_id: string; moderador_id: string }) => {
    setIncidencias((prev) =>
      prev.map((i) => (i.id === data.incidencia_id ? { ...i, moderador_id: data.moderador_id } : i))
    );
  }, []);

  // Callback para incidencia resuelta
  const handleIncidenciaResuelta = useCallback((data: { incidencia_id: string }) => {
    setIncidencias((prev) =>
      prev.map((i) => (i.id === data.incidencia_id ? { ...i, estado: 'resuelto' } : i))
    );
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
      console.log('✅ Conectado al namespace /incidencias');
      setIsConnected(true);

      // Unirse a las salas correspondientes
      if (usuarioId) {
        socketInstance.emit('join_usuario', { usuario_id: usuarioId });
      }
      if (incidenciaId) {
        socketInstance.emit('join_incidencia', { incidencia_id: incidenciaId });
      }
      if (esModerador) {
        socketInstance.emit('join_moderadores');
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Desconectado del namespace /incidencias');
      setIsConnected(false);
    });

    // Escuchar eventos de incidencias
    socketInstance.on('incidencia:nueva', handleNuevaIncidencia);
    socketInstance.on('incidencia:estado_cambiado', handleEstadoCambiado);
    socketInstance.on('incidencia:asignada', handleIncidenciaAsignada);
    socketInstance.on('incidencia:resuelta', handleIncidenciaResuelta);

    setSocket(socketInstance);

    return () => {
      socketInstance.off('incidencia:nueva', handleNuevaIncidencia);
      socketInstance.off('incidencia:estado_cambiado', handleEstadoCambiado);
      socketInstance.off('incidencia:asignada', handleIncidenciaAsignada);
      socketInstance.off('incidencia:resuelta', handleIncidenciaResuelta);
      socketInstance.disconnect();
    };
  }, [autoConnect, usuarioId, incidenciaId, esModerador, handleNuevaIncidencia, handleEstadoCambiado, handleIncidenciaAsignada, handleIncidenciaResuelta]);

  const joinUsuario = useCallback((id: string) => {
    if (socket && isConnected) {
      socket.emit('join_usuario', { usuario_id: id });
    }
  }, [socket, isConnected]);

  const joinIncidencia = useCallback((id: string) => {
    if (socket && isConnected) {
      socket.emit('join_incidencia', { incidencia_id: id });
    }
  }, [socket, isConnected]);

  const joinModeradores = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('join_moderadores');
    }
  }, [socket, isConnected]);

  return {
    socket,
    incidencias,
    isConnected,
    setIncidencias,
    joinUsuario,
    joinIncidencia,
    joinModeradores,
  };
};

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3006/avances';

interface Avance {
  id: string;
  titulo: string;
  descripcion: string;
  proyecto_id: string;
  porcentaje_completado?: number;
  imagenes?: string[];
  fecha_avance?: string;
  created_at: string;
  updated_at: string;
}

interface UseAvancesOptions {
  proyectoId?: string;
  arquitectoId?: string;
  clienteId?: string;
  autoConnect?: boolean;
}

export const useAvances = (options: UseAvancesOptions = {}) => {
  const { proyectoId, arquitectoId, clienteId, autoConnect = true } = options;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [avances, setAvances] = useState<Avance[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Callback para nuevo avance
  const handleNuevoAvance = useCallback((avance: Avance) => {
    setAvances((prev) => {
      if (prev.some((a) => a.id === avance.id)) {
        return prev;
      }
      return [avance, ...prev];
    });
  }, []);

  // Callback para avance actualizado
  const handleAvanceActualizado = useCallback((avance: Avance) => {
    setAvances((prev) =>
      prev.map((a) => (a.id === avance.id ? { ...a, ...avance } : a))
    );
  }, []);

  // Callback para avance eliminado
  const handleAvanceEliminado = useCallback((data: { avance_id: string }) => {
    setAvances((prev) => prev.filter((a) => a.id !== data.avance_id));
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
      console.log('✅ Conectado al namespace /avances');
      setIsConnected(true);

      // Unirse a las salas correspondientes
      if (proyectoId) {
        socketInstance.emit('join_proyecto', { proyecto_id: proyectoId });
      }
      if (arquitectoId) {
        socketInstance.emit('join_arquitecto', { arquitecto_id: arquitectoId });
      }
      if (clienteId) {
        socketInstance.emit('join_cliente', { cliente_id: clienteId });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Desconectado del namespace /avances');
      setIsConnected(false);
    });

    // Escuchar eventos de avances
    socketInstance.on('avance:nuevo', handleNuevoAvance);
    socketInstance.on('avance:actualizado', handleAvanceActualizado);
    socketInstance.on('avance:eliminado', handleAvanceEliminado);

    setSocket(socketInstance);

    return () => {
      socketInstance.off('avance:nuevo', handleNuevoAvance);
      socketInstance.off('avance:actualizado', handleAvanceActualizado);
      socketInstance.off('avance:eliminado', handleAvanceEliminado);
      socketInstance.disconnect();
    };
  }, [autoConnect, proyectoId, arquitectoId, clienteId, handleNuevoAvance, handleAvanceActualizado, handleAvanceEliminado]);

  const joinProyecto = useCallback((id: string) => {
    if (socket && isConnected) {
      socket.emit('join_proyecto', { proyecto_id: id });
    }
  }, [socket, isConnected]);

  const joinArquitecto = useCallback((id: string) => {
    if (socket && isConnected) {
      socket.emit('join_arquitecto', { arquitecto_id: id });
    }
  }, [socket, isConnected]);

  const joinCliente = useCallback((id: string) => {
    if (socket && isConnected) {
      socket.emit('join_cliente', { cliente_id: id });
    }
  }, [socket, isConnected]);

  return {
    socket,
    avances,
    isConnected,
    setAvances,
    joinProyecto,
    joinArquitecto,
    joinCliente,
  };
};

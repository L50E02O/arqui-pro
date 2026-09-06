import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3006/proyectos';

interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  estado: string;
  tipo_proyecto: string;
  cliente_id?: string;
  arquitecto_id?: string;
  presupuesto?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  created_at: string;
  updated_at: string;
}

interface UseProyectosOptions {
  arquitectoId?: string;
  clienteId?: string;
  proyectoId?: string;
  autoConnect?: boolean;
}

export const useProyectos = (options: UseProyectosOptions = {}) => {
  const { arquitectoId, clienteId, proyectoId, autoConnect = true } = options;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Callback para agregar un nuevo proyecto
  const handleNuevoProyecto = useCallback((proyecto: Proyecto) => {
    setProyectos((prev) => {
      // Evitar duplicados
      if (prev.some((p) => p.id === proyecto.id)) {
        return prev;
      }
      return [proyecto, ...prev];
    });
  }, []);

  // Callback para actualizar un proyecto existente
  const handleProyectoActualizado = useCallback((proyecto: Proyecto) => {
    setProyectos((prev) =>
      prev.map((p) => (p.id === proyecto.id ? { ...p, ...proyecto } : p))
    );
  }, []);

  // Callback para cambio de estado
  const handleEstadoCambiado = useCallback((data: { proyecto_id: string; estado: string }) => {
    setProyectos((prev) =>
      prev.map((p) => (p.id === data.proyecto_id ? { ...p, estado: data.estado } : p))
    );
  }, []);

  // Callback para asignación de proyecto
  const handleProyectoAsignado = useCallback((data: { proyecto_id: string; arquitecto_id: string }) => {
    setProyectos((prev) =>
      prev.map((p) => (p.id === data.proyecto_id ? { ...p, arquitecto_id: data.arquitecto_id } : p))
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
      console.log('✅ Conectado al namespace /proyectos');
      setIsConnected(true);

      // Unirse a las salas correspondientes
      if (arquitectoId) {
        socketInstance.emit('join_arquitecto', { arquitecto_id: arquitectoId });
      }
      if (clienteId) {
        socketInstance.emit('join_cliente', { cliente_id: clienteId });
      }
      if (proyectoId) {
        socketInstance.emit('join_proyecto', { proyecto_id: proyectoId });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Desconectado del namespace /proyectos');
      setIsConnected(false);
    });

    // Escuchar eventos de proyectos
    socketInstance.on('proyecto:nuevo', handleNuevoProyecto);
    socketInstance.on('proyecto:actualizado', handleProyectoActualizado);
    socketInstance.on('proyecto:estado_cambiado', handleEstadoCambiado);
    socketInstance.on('proyecto:asignado', handleProyectoAsignado);

    setSocket(socketInstance);

    return () => {
      socketInstance.off('proyecto:nuevo', handleNuevoProyecto);
      socketInstance.off('proyecto:actualizado', handleProyectoActualizado);
      socketInstance.off('proyecto:estado_cambiado', handleEstadoCambiado);
      socketInstance.off('proyecto:asignado', handleProyectoAsignado);
      socketInstance.disconnect();
    };
  }, [autoConnect, arquitectoId, clienteId, proyectoId, handleNuevoProyecto, handleProyectoActualizado, handleEstadoCambiado, handleProyectoAsignado]);

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

  const joinProyecto = useCallback((id: string) => {
    if (socket && isConnected) {
      socket.emit('join_proyecto', { proyecto_id: id });
    }
  }, [socket, isConnected]);

  return {
    socket,
    proyectos,
    isConnected,
    setProyectos,
    joinArquitecto,
    joinCliente,
    joinProyecto,
  };
};

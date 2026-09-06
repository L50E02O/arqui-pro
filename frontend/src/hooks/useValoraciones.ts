import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3006/valoraciones';

interface Valoracion {
  id: string;
  calificacion: number;
  comentario: string;
  cliente_id: string;
  proyecto_id: string;
  created_at: string;
  updated_at: string;
}

interface PromedioActualizado {
  arquitecto_id: string;
  promedio: number;
  total_valoraciones: number;
}

interface UseValoracionesOptions {
  arquitectoId?: string;
  proyectoId?: string;
  autoConnect?: boolean;
}

export const useValoraciones = (options: UseValoracionesOptions = {}) => {
  const { arquitectoId, proyectoId, autoConnect = true } = options;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [promedio, setPromedio] = useState<number | null>(null);
  const [totalValoraciones, setTotalValoraciones] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);

  // Callback para nueva valoración
  const handleNuevaValoracion = useCallback((valoracion: Valoracion) => {
    setValoraciones((prev) => {
      if (prev.some((v) => v.id === valoracion.id)) {
        return prev;
      }
      return [valoracion, ...prev];
    });
  }, []);

  // Callback para valoración actualizada
  const handleValoracionActualizada = useCallback((valoracion: Valoracion) => {
    setValoraciones((prev) =>
      prev.map((v) => (v.id === valoracion.id ? { ...v, ...valoracion } : v))
    );
  }, []);

  // Callback para valoración eliminada
  const handleValoracionEliminada = useCallback((data: { valoracion_id: string }) => {
    setValoraciones((prev) => prev.filter((v) => v.id !== data.valoracion_id));
  }, []);

  // Callback para promedio actualizado
  const handlePromedioActualizado = useCallback((data: PromedioActualizado | { valoracion_promedio: number; total_valoraciones: number }) => {
    // Soportar ambos formatos: { promedio } o { valoracion_promedio }
    const promedio = 'promedio' in data ? data.promedio : data.valoracion_promedio;
    const total = data.total_valoraciones;
    
    setPromedio(promedio);
    setTotalValoraciones(total);
    
    console.log('📊 Promedio actualizado:', { promedio, total_valoraciones: total });
  }, []);

  useEffect(() => {
    if (!autoConnect) return;

    console.log('🔄 Intentando conectar a WebSocket:', SOCKET_URL);

    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Conectado al namespace /valoraciones');
      console.log('   Socket ID:', socketInstance.id);
      setIsConnected(true);

      // Unirse a las salas correspondientes
      if (arquitectoId) {
        console.log('🔗 Uniéndose a sala arquitecto:', arquitectoId);
        socketInstance.emit('join_arquitecto', { arquitecto_id: arquitectoId });
      }
      if (proyectoId) {
        console.log('🔗 Uniéndose a sala proyecto:', proyectoId);
        socketInstance.emit('join_proyecto', { proyecto_id: proyectoId });
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error.message);
      console.error('   URL:', SOCKET_URL);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Desconectado del namespace /valoraciones');
      console.log('   Razón:', reason);
      setIsConnected(false);
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Intento de reconexión #' + attemptNumber);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('✅ Reconectado después de', attemptNumber, 'intentos');
    });

    // Escuchar eventos de valoraciones
    socketInstance.on('valoracion:nueva', handleNuevaValoracion);
    socketInstance.on('valoracion:actualizada', handleValoracionActualizada);
    socketInstance.on('valoracion:eliminada', handleValoracionEliminada);
    socketInstance.on('valoracion:promedio_actualizado', handlePromedioActualizado);

    setSocket(socketInstance);

    return () => {
      console.log('🔌 Desconectando socket de valoraciones');
      socketInstance.off('valoracion:nueva', handleNuevaValoracion);
      socketInstance.off('valoracion:actualizada', handleValoracionActualizada);
      socketInstance.off('valoracion:eliminada', handleValoracionEliminada);
      socketInstance.off('valoracion:promedio_actualizado', handlePromedioActualizado);
      socketInstance.disconnect();
    };
  }, [autoConnect, arquitectoId, proyectoId, handleNuevaValoracion, handleValoracionActualizada, handleValoracionEliminada, handlePromedioActualizado]);

  const joinArquitecto = useCallback((id: string) => {
    if (socket && isConnected) {
      console.log('🔗 Enviando solicitud para unirse a sala arquitecto:', id);
      socket.emit('join_arquitecto', { arquitecto_id: id });
    } else {
      console.warn('⚠️ No se puede unir: socket no conectado', { socket: !!socket, isConnected });
    }
  }, [socket, isConnected]);

  const joinProyecto = useCallback((id: string) => {
    if (socket && isConnected) {
      console.log('🔗 Enviando solicitud para unirse a sala proyecto:', id);
      socket.emit('join_proyecto', { proyecto_id: id });
    } else {
      console.warn('⚠️ No se puede unir: socket no conectado', { socket: !!socket, isConnected });
    }
  }, [socket, isConnected]);

  // Función para inicializar el promedio con datos de la API
  const initializePromedio = useCallback((promedioInicial: number, totalInicial: number) => {
    console.log('🔧 Inicializando promedio:', { promedioInicial, totalInicial });
    setPromedio(promedioInicial);
    setTotalValoraciones(totalInicial);
  }, []);

  return {
    socket,
    valoraciones,
    promedio,
    totalValoraciones,
    isConnected,
    setValoraciones,
    joinArquitecto,
    joinProyecto,
    initializePromedio,
  };
};

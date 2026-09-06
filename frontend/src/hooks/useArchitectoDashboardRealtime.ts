import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3006';

interface DashboardStats {
  totalProyectos: number;
  proyectosEnProgreso: number;
  proyectosCompletados: number;
  promedioValoracion: number;
  totalAvances: number;
}

interface UseArchitectoDashboardRealtimeOptions {
  arquitectoId?: string;
  autoConnect?: boolean;
}

export const useArchitectoDashboardRealtime = (options: UseArchitectoDashboardRealtimeOptions = {}) => {
  const { arquitectoId, autoConnect = true } = options;
  
  // Estados
  const [stats, setStats] = useState<DashboardStats>({
    totalProyectos: 0,
    proyectosEnProgreso: 0,
    proyectosCompletados: 0,
    promedioValoracion: 0,
    totalAvances: 0,
  });
  
  const [isConnected, setIsConnected] = useState(false);

  // Inicializar con datos de la API
  const initialize = useCallback((initialStats: Partial<DashboardStats>) => {
    console.log('[Dashboard] Inicializando con datos:', initialStats);
    setStats(prev => ({ ...prev, ...initialStats }));
  }, []);

  // Conectar a los WebSockets necesarios
  useEffect(() => {
    if (!autoConnect || !arquitectoId) return;

    console.log('[Dashboard] Conectando a WebSockets...');

    // Socket para proyectos
    const proyectosSocket = io(`${SOCKET_URL}/proyectos`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Socket para valoraciones
    const valoracionesSocket = io(`${SOCKET_URL}/valoraciones`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Socket para avances
    const avancesSocket = io(`${SOCKET_URL}/avances`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Manejar conexion de proyectos
    proyectosSocket.on('connect', () => {
      console.log('[Dashboard] Conectado a /proyectos');
      proyectosSocket.emit('join_arquitecto', { arquitecto_id: arquitectoId });
      checkAllConnected();
    });

    proyectosSocket.on('proyecto:nuevo', () => {
      console.log('[Dashboard] Nuevo proyecto detectado');
      setStats(prev => ({ ...prev, totalProyectos: prev.totalProyectos + 1 }));
    });

    proyectosSocket.on('proyecto:actualizado', (data: any) => {
      console.log('[Dashboard] Proyecto actualizado:', data);
    });

    // Manejar conexion de valoraciones
    valoracionesSocket.on('connect', () => {
      console.log('[Dashboard] Conectado a /valoraciones');
      valoracionesSocket.emit('join_arquitecto', { arquitecto_id: arquitectoId });
      checkAllConnected();
    });

    valoracionesSocket.on('valoracion:promedio_actualizado', (data: any) => {
      console.log('[Dashboard] Promedio actualizado:', data);
      const promedio = data.promedio || data.valoracion_promedio || 0;
      setStats(prev => ({ ...prev, promedioValoracion: promedio }));
    });

    // Manejar conexion de avances
    avancesSocket.on('connect', () => {
      console.log('[Dashboard] Conectado a /avances');
      avancesSocket.emit('join_arquitecto', { arquitecto_id: arquitectoId });
      checkAllConnected();
    });

    avancesSocket.on('avance:nuevo', () => {
      console.log('[Dashboard] Nuevo avance detectado');
      setStats(prev => ({ ...prev, totalAvances: prev.totalAvances + 1 }));
    });

    // Verificar si todos estan conectados
    const checkAllConnected = () => {
      const allConnected = 
        proyectosSocket.connected && 
        valoracionesSocket.connected && 
        avancesSocket.connected;
      
      if (allConnected) {
        console.log('[Dashboard] Todos los WebSockets conectados');
        setIsConnected(true);
      }
    };

    // Cleanup
    return () => {
      console.log('[Dashboard] Desconectando todos los WebSockets');
      proyectosSocket.disconnect();
      valoracionesSocket.disconnect();
      avancesSocket.disconnect();
    };
  }, [autoConnect, arquitectoId]);

  return {
    stats,
    isConnected,
    initialize,
  };
};

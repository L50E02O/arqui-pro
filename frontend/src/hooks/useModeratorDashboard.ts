import { useEffect, useState, useCallback } from 'react';
import { useProyectos } from './useProyectos';
import { useIncidencias } from './useIncidencias';
import { useVerificaciones } from './useVerificaciones';

interface UseModeratorDashboardOptions {
  moderadorId?: string;
  autoConnect?: boolean;
}

interface DashboardStats {
  totalProyectos: number;
  proyectosNuevos: number;
  totalIncidencias: number;
  incidenciasPendientes: number;
  incidenciasEnProceso: number;
  incidenciasResueltas: number;
  arquitectosVerificados: number;
  totalNotificaciones: number;
  notificacionesSinLeer: number;
}

export const useModeratorDashboard = (options: UseModeratorDashboardOptions = {}) => {
  const { autoConnect = true } = options;
  
  // Estado consolidado
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProyectos: 0,
    proyectosNuevos: 0,
    totalIncidencias: 0,
    incidenciasPendientes: 0,
    incidenciasEnProceso: 0,
    incidenciasResueltas: 0,
    arquitectosVerificados: 0,
    totalNotificaciones: 0,
    notificacionesSinLeer: 0,
  });

  // Conectar a todos los websockets
  const proyectosWS = useProyectos({
    autoConnect,
  });

  const incidenciasWS = useIncidencias({
    esModerador: true,
    autoConnect,
  });

  const verificacionesWS = useVerificaciones({
    autoConnect,
  });

  // Sincronizar proyectos
  useEffect(() => {
    if (Array.isArray(proyectosWS.proyectos)) {
      setProyectos(proyectosWS.proyectos);
    }
  }, [proyectosWS.proyectos]);

  // Sincronizar incidencias
  useEffect(() => {
    if (Array.isArray(incidenciasWS.incidencias)) {
      setIncidencias(incidenciasWS.incidencias);
    }
  }, [incidenciasWS.incidencias]);

  // Calcular estadísticas en tiempo real
  const calcularEstadisticas = useCallback(() => {
    // Validar que proyectos e incidencias sean arrays
    if (!Array.isArray(proyectos) || !Array.isArray(incidencias)) {
      console.warn('Proyectos o incidencias no son arrays válidos');
      return;
    }

    // Proyectos del último mes
    const unMesAtras = new Date();
    unMesAtras.setMonth(unMesAtras.getMonth() - 1);
    
    const proyectosNuevos = proyectos.filter(p => {
      const fecha = new Date(p.created_at || p.fecha_publicacion);
      return fecha >= unMesAtras;
    }).length;

    // Contar incidencias por estado
    const incidenciasPendientes = incidencias.filter(
      i => i.estado === 'pendiente'
    ).length;

    const incidenciasEnProceso = incidencias.filter(
      i => i.estado === 'en_proceso'
    ).length;

    const incidenciasResueltas = incidencias.filter(
      i => i.estado === 'resuelto' || i.estado === 'cerrado'
    ).length;

    setStats({
      totalProyectos: proyectos.length,
      proyectosNuevos,
      totalIncidencias: incidencias.length,
      incidenciasPendientes,
      incidenciasEnProceso,
      incidenciasResueltas,
      arquitectosVerificados: verificacionesWS.arquitectosVerificados,
      totalNotificaciones: 0,
      notificacionesSinLeer: 0,
    });
  }, [proyectos, incidencias, verificacionesWS.arquitectosVerificados]);

  // Recalcular estadísticas cuando cambien los datos
  useEffect(() => {
    calcularEstadisticas();
  }, [calcularEstadisticas]);

  // Función para inicializar datos desde API
  const initializeData = useCallback((
    initialProyectos?: any[],
    initialIncidencias?: any[],
    initialArquitectosVerificados?: number
  ) => {
    if (initialProyectos) setProyectos(initialProyectos);
    if (initialIncidencias) setIncidencias(initialIncidencias);
    if (initialArquitectosVerificados !== undefined) {
      verificacionesWS.setArquitectosVerificados(initialArquitectosVerificados);
    }
  }, [verificacionesWS]);

  // Estado de conexión consolidado
  const isConnected = 
    proyectosWS.isConnected || 
    incidenciasWS.isConnected ||
    verificacionesWS.isConnected;

  const allConnected =
    proyectosWS.isConnected &&
    incidenciasWS.isConnected &&
    verificacionesWS.isConnected;

  return {
    // Datos
    proyectos,
    incidencias,
    stats,
    
    // Estados de conexión
    isConnected,
    allConnected,
    connections: {
      proyectos: proyectosWS.isConnected,
      incidencias: incidenciasWS.isConnected,
      verificaciones: verificacionesWS.isConnected,
    },
    
    // Funciones
    initializeData,
    setProyectos: proyectosWS.setProyectos,
    setIncidencias: incidenciasWS.setIncidencias,
    
    // Sockets individuales (por si se necesitan)
    sockets: {
      proyectos: proyectosWS.socket,
      incidencias: incidenciasWS.socket,
      verificaciones: verificacionesWS.socket,
    },
  };
};

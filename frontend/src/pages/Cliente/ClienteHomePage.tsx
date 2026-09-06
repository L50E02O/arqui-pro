import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useProyectos } from '../../hooks/useProyectos'
import { useValoraciones } from '../../hooks/useValoraciones'
import ArquitectoCard from '../../components/common/ArquitectoCard'
import TarjetaProyecto from '../../components/common/TarjetaProyecto'
import TarjetaSolicitud from '../../components/common/TarjetaSolicitud'
import arquitectosService from '../../services/api/arquitectosService'
import proyectosService from '../../services/api/proyectosService'
import solicitudesService from '../../services/api/solicitudesService'
import type { Arquitecto, Proyecto, SolicitudProyecto } from '../../types'
import { logger } from '../../utils/logger'
import '../../styles/ClienteHome.css'

const ClienteHome = () => {
  const { user } = useAuth()
  const [arquitectosRecomendados, setArquitectosRecomendados] = useState<Arquitecto[]>([])
  const [proyectosRecientes, setProyectosRecientes] = useState<Proyecto[]>([])
  const [solicitudesRecientes, setSolicitudesRecientes] = useState<SolicitudProyecto[]>([])
  const [loading, setLoading] = useState(true)
  const [clienteId, setClienteId] = useState<string | null>(null)

  // WebSocket hooks para actualizaciones en tiempo real
  const { proyectos: proyectosWS, isConnected: proyectosConnected } = useProyectos({
    clienteId: clienteId || undefined,
    autoConnect: !!clienteId
  });

  const { isConnected: valoracionesConnected } = useValoraciones({
    autoConnect: true
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        
        // TODO: Obtener cliente_id desde el usuario autenticado
        // Por ahora usamos un valor temporal o del localStorage
        const tempUsuarioClienteId = localStorage.getItem('cliente_id') || user?.id
        setClienteId(tempUsuarioClienteId || null);

        // Cargar arquitectos recomendados (ordenados por valoración)
        const arquitectosData = await arquitectosService.getAll({
          verificado: true,
          per_page: 3
        })
        
        // Ordenar por valoración promedio descendente
        const arquitectosOrdenados = [...(arquitectosData || [])]
          .sort((a, b) => (b.valoracion_prom_proyecto || 0) - (a.valoracion_prom_proyecto || 0))
          .slice(0, 3)
        
        setArquitectosRecomendados(arquitectosOrdenados)

        if (tempUsuarioClienteId) {
          // Cargar proyectos del cliente
          const proyectos = await proyectosService.getByUsuarioCliente(tempUsuarioClienteId)
          setProyectosRecientes(proyectos.slice(0, 4))

          // Cargar solicitudes del cliente
          const solicitudes = await solicitudesService.getByUsuarioCliente(tempUsuarioClienteId)

          // Ordenar por más recientes primero
          const solicitudesOrdenadas = [...(solicitudes || [])]
            .sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime())
            .slice(0, 3)
          setSolicitudesRecientes(solicitudesOrdenadas)
        }

        logger.info('Datos del home del cliente cargados exitosamente')
      } catch (error) {
        logger.error('Error al cargar datos del home del cliente:', error)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [user]);

  // Actualizar proyectos cuando lleguen desde WebSocket
  useEffect(() => {
    if (proyectosWS.length > 0) {
      setProyectosRecientes(prev => {
        const nuevosProyectos = [...proyectosWS, ...prev];
        const proyectosUnicos = Array.from(
          new Map(nuevosProyectos.map(p => [p.id, p])).values()
        ) as Proyecto[];
        return proyectosUnicos.slice(0, 4);
      });
    }
  }, [proyectosWS]);

  if (loading) {
    return (
      <div className="cliente-home-loading">
        <div className="ch-loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="cliente-home">
      {/* Bienvenida */}
      <header className="cliente-home-header">
        <h1 className="cliente-home-titulo">
          Bienvenido de Nuevo, <span className="nombre-usuario">{user?.nombre}!</span>
        </h1>
      </header>

      <div className="cliente-home-grid">
        {/* Columna Principal */}
        <div className="cliente-home-main">
          {/* Arquitectos Recomendados */}
          <section className="seccion-arquitectos">
            <h2 className="seccion-titulo">Arquitectos Recomendados</h2>
            <div className="arquitectos-grid">
              {arquitectosRecomendados.length > 0 ? (
                arquitectosRecomendados.map((arquitecto) => (
                  <ArquitectoCard key={arquitecto.id} arquitecto={arquitecto} />
                ))
              ) : (
                <p className="sin-datos">No hay arquitectos disponibles en este momento.</p>
              )}
            </div>
          </section>

          {/* Proyectos Recientes */}
          <section className="seccion-proyectos">
            <h2 className="seccion-titulo">
              Proyectos Recientes
              {proyectosConnected && (
                <span className="ws-status ws-connected" title="WebSocket conectado">●</span>
              )}
            </h2>
            <div className="proyectos-grid">
              {proyectosRecientes.length > 0 ? (
                proyectosRecientes.map((proyecto) => (
                  <TarjetaProyecto key={proyecto.id} proyecto={proyecto} />
                ))
              ) : (
                <div className="sin-proyectos">
                  <p className="sin-datos-mensaje">Aún no tienes proyectos.</p>
                  <p className="sin-datos-ayuda">
                    Comienza buscando arquitectos y enviando solicitudes para tus proyectos.
                  </p>
                </div>
              )}
            </div>
            {(proyectosConnected || valoracionesConnected) && (
              <div className="ws-indicator-small">
                <span className="ws-dot"></span>
                <span className="ws-text">Actualizaciones en tiempo real</span>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Derecho - Solicitudes Recientes */}
        <aside className="cliente-home-sidebar">
          <section className="seccion-solicitudes">
            <h2 className="seccion-titulo">Solicitudes Recientes de Proyecto</h2>
            <div className="solicitudes-lista">
              {solicitudesRecientes.length > 0 ? (
                solicitudesRecientes.map((solicitud) => (
                  <TarjetaSolicitud key={solicitud.id} solicitud={solicitud} />
                ))
              ) : (
                <div className="sin-solicitudes">
                  <p className="sin-datos-mensaje">No tienes solicitudes activas.</p>
                  <p className="sin-datos-ayuda">
                    Crea una nueva solicitud para comenzar tu proyecto.
                  </p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default ClienteHome

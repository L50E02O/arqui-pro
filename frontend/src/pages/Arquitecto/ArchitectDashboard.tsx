import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Clock,
  CheckCircle,
  Star,
  Layers,
  MessageSquare,
  User as UserIcon,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useArchitectoDashboardRealtime } from '../../hooks/useArchitectoDashboardRealtime';
import { logger } from '../../utils/logger';
import arquitectosService from '../../services/api/arquitectosService';
import proyectosService from '../../services/api/proyectosService';
import avancesService from '../../services/api/avancesService';
import valoracionesService from '../../services/api/valoracionesService';
import type { Arquitecto, Proyecto, Avance, Valoracion } from '../../types';
import '../../styles/ArchitectDashboard.css';

type Props = Record<string, never>;

export default function ArchitectDashboard({}: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [arquitecto, setArquitecto] = useState<Arquitecto | null>(null);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectosRecientes, setProyectosRecientes] = useState<Proyecto[]>([]);
  const [avances, setAvances] = useState<Avance[]>([]);
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [loading, setLoading] = useState(true);

  const { stats, isConnected, initialize } = useArchitectoDashboardRealtime({
    arquitectoId: arquitecto?.id?.toString(),
    autoConnect: !!arquitecto?.id,
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        const response = await arquitectosService.getAll();
        const arquitectoEncontrado = response.find(
          (arq) => arq.usuario_id === user?.id || arq.usuario?.id === user?.id
        );

        if (arquitectoEncontrado) {
          setArquitecto(arquitectoEncontrado);

          const allProyectos = await proyectosService.getAll();
          const proyectosArquitecto = allProyectos.filter(
            (p) => String(p.arquitecto_id) === String(arquitectoEncontrado.id)
          );
          setProyectos(proyectosArquitecto);

          let avancesArquitecto: Avance[] = [];
          try {
            const allAvances = await avancesService.getAvances();
            avancesArquitecto = allAvances.filter((avance: Avance) =>
              proyectosArquitecto.some((p) => p.id === avance.proyecto_id)
            );
            setAvances(avancesArquitecto);
          } catch (error) {
            logger.warn('No se pudieron cargar los avances:', error);
          }

          const proyectosConActividad = proyectosArquitecto.map((proyecto) => {
            const fechaCreacion = new Date(proyecto.fecha_publicacion || 0);

            const avancesProyecto = avancesArquitecto.filter(
              (a) => a.proyecto_id === proyecto.id
            );
            const fechaUltimoAvance =
              avancesProyecto.length > 0
                ? new Date(
                    Math.max(
                      ...avancesProyecto.map((a) => new Date(a.fecha || 0).getTime())
                    )
                  )
                : new Date(0);

            const fechaMasReciente = new Date(
              Math.max(fechaCreacion.getTime(), fechaUltimoAvance.getTime())
            );

            return {
              ...proyecto,
              ultimaActividad: fechaMasReciente,
            };
          });

          const proyectosOrdenados = proyectosConActividad.sort(
            (a, b) => b.ultimaActividad.getTime() - a.ultimaActividad.getTime()
          );

          setProyectosRecientes(proyectosOrdenados.slice(0, 4));

          const proyectosEnProgreso = proyectosArquitecto.filter(
            (p) => p.tipo_proyecto === 'contratado'
          ).length;
          const proyectosCompletados = proyectosArquitecto.filter(
            (p) => p.tipo_proyecto === 'portafolio'
          ).length;

          initialize({
            totalProyectos: proyectosArquitecto.length,
            proyectosEnProgreso,
            proyectosCompletados,
            promedioValoracion: arquitectoEncontrado.valoracion_prom_proyecto || 0,
            totalAvances: avancesArquitecto.length,
          });

          try {
            const allValoraciones = await valoracionesService.getAll();
            const valoracionesArquitecto = allValoraciones.filter((val: Valoracion) =>
              proyectosArquitecto.some((p) => p.id === val.proyecto_id)
            );
            setValoraciones(valoracionesArquitecto);
          } catch (error) {
            logger.warn('No se pudieron cargar las valoraciones:', error);
          }
        }

        logger.info('Datos del dashboard del arquitecto cargados exitosamente');
      } catch (error) {
        logger.error('Error al cargar datos del dashboard del arquitecto:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [user, initialize]);

  if (loading) {
    return (
      <div className="arquitecto-dashboard-loading">
        <div className="ad-loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  const totalProyectos =
    isConnected && stats.totalProyectos !== undefined
      ? stats.totalProyectos
      : proyectos.length;

  const proyectosEnProgreso =
    isConnected && stats.proyectosEnProgreso !== undefined
      ? stats.proyectosEnProgreso
      : proyectos.filter((p) => p.tipo_proyecto === 'contratado').length;

  const proyectosCompletados =
    isConnected && stats.proyectosCompletados !== undefined
      ? stats.proyectosCompletados
      : proyectos.filter((p) => p.tipo_proyecto === 'portafolio').length;

  const totalAvances =
    isConnected && stats.totalAvances !== undefined
      ? stats.totalAvances
      : avances.length;

  const promedio =
    isConnected && stats.promedioValoracion !== undefined
      ? stats.promedioValoracion
      : valoraciones.length > 0
      ? valoraciones.reduce((sum, val) => sum + (val.calificacion || 0), 0) /
        valoraciones.length
      : arquitecto?.valoracion_prom_proyecto || 0;

  return (
    <div className="arquitecto-dashboard">
      <header className="arquitecto-dashboard-header">
        <h1 className="arquitecto-dashboard-titulo">
          Bienvenido de Nuevo, <span className="nombre-usuario">{user?.nombre}!</span>
        </h1>
      </header>

      <div className="arquitecto-dashboard-grid">
        <div className="arquitecto-dashboard-main">
          <section className="seccion-proyectos">
            <div className="seccion-header">
              <h2 className="seccion-titulo">Actividad Reciente</h2>
              <button
                onClick={() => navigate('/arquitecto/mis-proyectos')}
                className="btn-ver-todos"
              >
                Ver todos los proyectos →
              </button>
            </div>
            <div className="proyectos-grid">
              {proyectosRecientes.length > 0 ? (
                proyectosRecientes.map((proyecto) => (
                  <div
                    key={proyecto.id}
                    className="proyecto-card"
                    onClick={() => navigate(`/arquitecto/project/${proyecto.id}`)}
                  >
                    <div className="proyecto-imagen">
                      <img
                        src={
                          proyecto.imagenes?.[0]?.imagen_url ||
                          'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400'
                        }
                        alt={proyecto.titulo_proyecto}
                      />
                    </div>
                    <div className="proyecto-contenido">
                      <h3 className="proyecto-titulo">{proyecto.titulo_proyecto}</h3>
                      <p className="proyecto-descripcion">
                        {proyecto.descripcion.substring(0, 100)}
                        {proyecto.descripcion.length > 100 ? '...' : ''}
                      </p>
                      <div className="proyecto-footer">
                        <span className="proyecto-tipo">
                          {proyecto.tipo_proyecto === 'portafolio'
                            ? 'Portafolio'
                            : 'Contratado'}
                        </span>
                        <span className="proyecto-valoracion flex items-center gap-1">
                          {proyecto.valoracion_promedio &&
                          proyecto.valoracion_promedio > 0 ? (
                            <>
                              <Star size={14} fill="#eab308" color="#eab308" />
                              {proyecto.valoracion_promedio.toFixed(1)}
                            </>
                          ) : (
                            'En progreso'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sin-proyectos">
                  <p className="sin-datos-mensaje">Aún no tienes proyectos.</p>
                  <p className="sin-datos-ayuda">
                    Comienza creando tu primer proyecto para mostrar tu trabajo.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="arquitecto-dashboard-sidebar">
          <section className="seccion-estadisticas">
            <h2 className="seccion-titulo flex items-center gap-2">
              Estadísticas
              {isConnected && (
                <span
                  className="ws-status-indicator flex items-center gap-1"
                  title="Actualización en tiempo real activa"
                >
                  <Radio size={14} color="#10b981" />
                  En vivo
                </span>
              )}
            </h2>
            <div className="estadisticas-lista">
              <div className="estadistica-item">
                <div className="estadistica-icono total">
                  <FolderKanban size={24} />
                </div>
                <div className="estadistica-info">
                  <span className="estadistica-numero">{totalProyectos}</span>
                  <span className="estadistica-texto">Total Proyectos</span>
                </div>
              </div>

              <div className="estadistica-item">
                <div className="estadistica-icono en-progreso">
                  <Clock size={24} />
                </div>
                <div className="estadistica-info">
                  <span className="estadistica-numero">{proyectosEnProgreso}</span>
                  <span className="estadistica-texto">En Progreso</span>
                </div>
              </div>

              <div className="estadistica-item">
                <div className="estadistica-icono completado">
                  <CheckCircle size={24} />
                </div>
                <div className="estadistica-info">
                  <span className="estadistica-numero">{proyectosCompletados}</span>
                  <span className="estadistica-texto">Completados</span>
                </div>
              </div>

              <div className="estadistica-item">
                <div className="estadistica-icono valoracion">
                  <Star size={24} fill="currentColor" />
                </div>
                <div className="estadistica-info">
                  <span className="estadistica-numero">
                    {promedio > 0
                      ? promedio.toFixed(1)
                      : arquitecto?.valoracion_prom_proyecto
                      ? arquitecto.valoracion_prom_proyecto.toFixed(1)
                      : '0.0'}
                  </span>
                  <span className="estadistica-texto">Valoración Promedio</span>
                </div>
              </div>

              <div className="estadistica-item">
                <div className="estadistica-icono avances">
                  <Layers size={24} />
                </div>
                <div className="estadistica-info">
                  <span className="estadistica-numero">{totalAvances}</span>
                  <span className="estadistica-texto">Avances Registrados</span>
                </div>
              </div>
            </div>
          </section>

          <section className="seccion-acciones">
            <h2 className="seccion-titulo">Acciones Rápidas</h2>
            <div className="acciones-lista">
              <button
                onClick={() => navigate('/arquitecto/chat')}
                className="accion-btn"
              >
                <MessageSquare size={18} />
                Ver Mensajes
              </button>
              <button
                onClick={() => navigate('/arquitecto/profile')}
                className="accion-btn"
              >
                <UserIcon size={18} />
                Ver Mi Perfil
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

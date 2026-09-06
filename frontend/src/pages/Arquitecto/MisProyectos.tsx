import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, ImageIcon, Star, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../utils/logger';
import arquitectosService from '../../services/api/arquitectosService';
import proyectosService from '../../services/api/proyectosService';
import type { Proyecto } from '../../types';
import '../../styles/MisProyectos.css';

type Props = Record<string, never>;

export default function MisProyectos({}: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [filteredProyectos, setFilteredProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'portafolio' | 'contratado'>('todos');
  const [ordenar, setOrdenar] = useState<'reciente' | 'antiguo' | 'nombre'>('reciente');

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        setLoading(true);

        const response = await arquitectosService.getAll();
        const arquitectoEncontrado = response.find(
          (arq) => arq.usuario_id === user?.id || arq.usuario?.id === user?.id
        );

        if (arquitectoEncontrado) {
          const allProyectos = await proyectosService.getAll();
          const proyectosArquitecto = allProyectos.filter(
            (p) => String(p.arquitecto_id) === String(arquitectoEncontrado.id)
          );

          setProyectos(proyectosArquitecto);
          setFilteredProyectos(proyectosArquitecto);
        }

        logger.info('Proyectos cargados exitosamente');
      } catch (error) {
        logger.error('Error al cargar proyectos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
    async function cargarDatos() {
      await cargarProyectos();
    }
  }, [user]);

  useEffect(() => {
    let resultado = [...proyectos];

    if (filtro !== 'todos') {
      resultado = resultado.filter((p) => p.tipo_proyecto === filtro);
    }

    resultado.sort((a, b) => {
      switch (ordenar) {
        case 'reciente':
          return (
            new Date(b.fecha_publicacion || 0).getTime() -
            new Date(a.fecha_publicacion || 0).getTime()
          );
        case 'antiguo':
          return (
            new Date(a.fecha_publicacion || 0).getTime() -
            new Date(b.fecha_publicacion || 0).getTime()
          );
        case 'nombre':
          return a.titulo_proyecto.localeCompare(b.titulo_proyecto);
        default:
          return 0;
      }
    });

    setFilteredProyectos(resultado);
  }, [proyectos, filtro, ordenar]);

  if (loading) {
    return (
      <div className="mis-proyectos-loading">
        <div className="loading-spinner"></div>
        <p>Cargando proyectos...</p>
      </div>
    );
  }

  return (
    <div className="mis-proyectos-container">
      <header className="mis-proyectos-header">
        <div className="header-content">
          <h1>Mis Proyectos</h1>
          <button
            onClick={() => navigate('/arquitecto/create-project')}
            className="btn-crear-proyecto flex items-center gap-2"
          >
            <Plus size={18} />
            Crear Proyecto
          </button>
        </div>
      </header>

      <div className="filtros-container">
        <div className="filtros-tabs">
          <button
            className={`filtro-tab ${filtro === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltro('todos')}
          >
            Todos ({proyectos.length})
          </button>
          <button
            className={`filtro-tab ${filtro === 'contratado' ? 'active' : ''}`}
            onClick={() => setFiltro('contratado')}
          >
            Contratados ({proyectos.filter((p) => p.tipo_proyecto === 'contratado').length})
          </button>
          <button
            className={`filtro-tab ${filtro === 'portafolio' ? 'active' : ''}`}
            onClick={() => setFiltro('portafolio')}
          >
            Portafolio ({proyectos.filter((p) => p.tipo_proyecto === 'portafolio').length})
          </button>
        </div>

        <div className="filtros-ordenar">
          <div className="filtros-grupo">
            <label className="filtros-label">Ordenar:</label>
            <select
              value={ordenar}
              onChange={(e) => setOrdenar(e.target.value as 'reciente' | 'antiguo' | 'nombre')}
              className="select-ordenar"
            >
              <option value="reciente">Más reciente</option>
              <option value="antiguo">Más antiguo</option>
              <option value="nombre">Nombre A-Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="proyectos-grid-full">
        {filteredProyectos.length > 0 ? (
          filteredProyectos.map((proyecto) => (
            <div
              key={proyecto.id}
              className="proyecto-card-full"
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
                <div className="proyecto-overlay">
                  <span className="proyecto-estado flex items-center gap-1">
                    {proyecto.tipo_proyecto === 'contratado' ? (
                      <>
                        <Clock size={14} /> En progreso
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} /> Portafolio
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="proyecto-info">
                <h3>{proyecto.titulo_proyecto}</h3>
                <p className="proyecto-descripcion">
                  {proyecto.descripcion.substring(0, 120)}
                  {proyecto.descripcion.length > 120 ? '...' : ''}
                </p>

                <div className="proyecto-meta">
                  <span className="proyecto-tipo">
                    {proyecto.tipo_proyecto === 'portafolio' ? 'Portafolio' : 'Contratado'}
                  </span>
                  <span className="proyecto-valoracion flex items-center gap-1">
                    {proyecto.valoracion_promedio && proyecto.valoracion_promedio > 0 ? (
                      <>
                        <Star size={14} fill="#eab308" color="#eab308" />
                        {proyecto.valoracion_promedio.toFixed(1)}
                      </>
                    ) : (
                      'Sin valoraciones'
                    )}
                  </span>
                </div>

                <div className="proyecto-footer">
                  <span className="proyecto-fecha flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(proyecto.fecha_publicacion || '').toLocaleDateString('es-ES')}
                  </span>
                  {proyecto.imagenes && proyecto.imagenes.length > 0 && (
                    <span className="proyecto-imagenes flex items-center gap-1">
                      <ImageIcon size={14} />
                      {proyecto.imagenes.length}{' '}
                      {proyecto.imagenes.length === 1 ? 'imagen' : 'imágenes'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-proyectos">
            <p>No hay proyectos que coincidan con los filtros seleccionados</p>
            <button
              onClick={() => navigate('/arquitecto/create-project')}
              className="btn-crear-primer-proyecto flex items-center gap-2"
            >
              <Plus size={18} />
              Crear mi primer proyecto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

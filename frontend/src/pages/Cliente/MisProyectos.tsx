import { useEffect, useState } from 'react';
import { FolderKanban, Search, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import proyectosService from '../../services/api/proyectosService';
import ErrorMessage from '../../components/common/ErrorMessage';
import type { Proyecto } from '../../types';
import '../../styles/MisProyectos.css';

type Props = Record<string, never>;

export default function MisProyectos({}: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [filteredProyectos, setFilteredProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'todos' | 'contratado' | 'portafolio'>('todos');
  const [ordenar, setOrdenar] = useState<'reciente' | 'antiguo' | 'nombre'>('reciente');

  useEffect(() => {
    const fetchProyectos = async () => {
      if (!user?.id) {
        setError('Usuario no autenticado');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await proyectosService.getAll();
        const misProyectos = data.filter((p) => p.cliente_id === user.id);
        setProyectos(misProyectos);
        setFilteredProyectos(misProyectos);
      } catch (err: unknown) {
        const errorObj = err as { message?: string };
        setError(errorObj.message || 'Error al cargar los proyectos');
      } finally {
        setLoading(false);
      }
    };

    fetchProyectos();
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

  if (error) {
    return (
      <div className="mis-proyectos-container">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="mis-proyectos-container">
      <header className="mis-proyectos-header">
        <div className="header-content">
          <h1>Mis Proyectos Arquitectónicos</h1>
          <p className="subtitle">
            Gestiona y da seguimiento a tus proyectos con los mejores arquitectos
          </p>
        </div>
      </header>

      <div className="filtros-container">
        <div className="filtros-content">
          <div className="filtros-grupo">
            <span className="filtros-label">Filtrar por:</span>
            <div className="filtros-botones">
              <button
                className={`filtro-btn ${filtro === 'todos' ? 'active' : ''}`}
                onClick={() => setFiltro('todos')}
              >
                Todos ({proyectos.length})
              </button>
              <button
                className={`filtro-btn ${filtro === 'contratado' ? 'active' : ''}`}
                onClick={() => setFiltro('contratado')}
              >
                En Progreso
              </button>
              <button
                className={`filtro-btn ${filtro === 'portafolio' ? 'active' : ''}`}
                onClick={() => setFiltro('portafolio')}
              >
                Finalizados
              </button>
            </div>
          </div>

          <div className="filtros-grupo">
            <span className="filtros-label">Ordenar:</span>
            <select
              className="select-ordenar"
              value={ordenar}
              onChange={(e) => setOrdenar(e.target.value as 'reciente' | 'antiguo' | 'nombre')}
            >
              <option value="reciente">Más reciente</option>
              <option value="antiguo">Más antiguo</option>
              <option value="nombre">Nombre A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProyectos.length > 0 ? (
        <div className="proyectos-grid-full">
          {filteredProyectos.map((proyecto) => (
            <div
              key={proyecto.id}
              className="proyecto-card-full"
              onClick={() => navigate(`/cliente/proyectos/${proyecto.id}`)}
            >
              <div className="proyecto-imagen-container">
                {proyecto.imagenes && proyecto.imagenes.length > 0 ? (
                  <img
                    src={proyecto.imagenes[0].imagen_url}
                    alt={proyecto.titulo_proyecto}
                    className="proyecto-imagen"
                  />
                ) : (
                  <div className="proyecto-sin-imagen">
                    <FolderKanban size={48} />
                  </div>
                )}
                <div className="proyecto-tipo-badge flex items-center gap-1">
                  {proyecto.tipo_proyecto === 'portafolio' ? (
                    <>
                      <CheckCircle size={14} /> Finalizado
                    </>
                  ) : (
                    <>
                      <Clock size={14} /> En Progreso
                    </>
                  )}
                </div>
              </div>
              <div className="proyecto-info">
                <h3 className="proyecto-titulo">{proyecto.titulo_proyecto}</h3>
                <p className="proyecto-descripcion">
                  {proyecto.descripcion || 'Sin descripción'}
                </p>
                <div className="proyecto-meta">
                  <span className="proyecto-arquitecto">
                    Por {proyecto.arquitecto?.usuario?.nombre}{' '}
                    {proyecto.arquitecto?.usuario?.apellido}
                  </span>
                  <span className="proyecto-imagenes">
                    {proyecto.imagenes?.length || 0} imágenes
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-proyectos-container">
          <FolderKanban size={64} className="empty-proyectos-icon" />
          <h3 className="empty-proyectos-title">No hay proyectos</h3>
          <p className="empty-proyectos-desc">
            {filtro !== 'todos'
              ? `No tienes proyectos ${filtro === 'portafolio' ? 'finalizados' : 'en progreso'}`
              : 'Aún no tienes proyectos arquitectónicos'}
          </p>
          <button
            className="btn-crear-proyecto flex items-center gap-2"
            onClick={() => navigate('/cliente/buscar-arquitecto')}
          >
            <Search size={20} />
            Buscar Arquitecto
          </button>
        </div>
      )}
    </div>
  );
}

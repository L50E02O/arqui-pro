import { useState, useEffect } from 'react';
import { ModeratorLayout } from '../../components/Moderator/ModeratorLayout';
import { moderadorService } from '../../services/api/moderador/moderadorService';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Moderator/Verificaciones.css';

interface Verificacion {
  id: number;
  arquitecto_id: number;
  estado: 'pendiente' | 'verificado' | 'rechazado';
  fecha_verificacion: string;
  moderador_id?: number;
  comentarios?: string;
  arquitecto?: {
    id: number;
    cedula: string;
    usuario: {
      nombre: string;
      apellido: string;
      email: string;
    };
  };
  moderador?: {
    nombre: string;
    apellido: string;
  };
}

export const Verificaciones = () => {
  const { user } = useAuth();
  const [verificaciones, setVerificaciones] = useState<Verificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const perPage = 10;

  useEffect(() => {
    cargarVerificaciones();
  }, [page, filtroEstado]);

  const cargarVerificaciones = async () => {
    try {
      setLoading(true);
      console.log('Cargando verificaciones con filtro:', filtroEstado);
      const response = await moderadorService.getVerificaciones({
        estado: filtroEstado === 'todos' ? undefined : (filtroEstado as any),
        page,
        per_page: perPage
      });
      console.log('Respuesta verificaciones:', response);
      console.log('Verificaciones data:', response.data);
      setVerificaciones(response.data as any || []);
      setTotalPages(Math.ceil(response.total / perPage) || 1);
    } catch (error) {
      console.error('Error al cargar verificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id: number) => {
    if (!confirm('¿Estás seguro de aprobar esta verificación?')) return;
    
    const comentarios = prompt('Comentarios (opcional):') || '';
    
    try {
      await moderadorService.aprobarVerificacion(id, {
        moderador_id: user?.id || '',
        comentarios
      });
      cargarVerificaciones();
      alert('✅ Verificación aprobada exitosamente');
    } catch (error) {
      console.error('Error al aprobar:', error);
      alert('Error al aprobar la verificación');
    }
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'ver-badge-warning';
      case 'verificado':
        return 'ver-badge-success';
      case 'rechazado':
        return 'ver-badge-danger';
      default:
        return 'ver-badge-secondary';
    }
  };

  if (loading) {
    return (
      <ModeratorLayout>
        <div className="verificaciones-loading">Cargando...</div>
      </ModeratorLayout>
    );
  }

  return (
    <ModeratorLayout>
      <div className="verificaciones-page">
        <div className="page-header">
          <h1 className="page-title">Verificaciones</h1>
          <select 
            className="filtro-estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="verificado">Verificados</option>
          </select>
        </div>

        <div className="table-container">
          <table className="verificaciones-table">
            <thead>
              <tr>
                <th>ESTADO</th>
                <th>FECHA DE VERIFICACIÓN</th>
                <th>ARQUITECTO</th>
                <th>CÉDULA</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {verificaciones.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{textAlign: 'center', padding: '2rem'}}>
                    No hay verificaciones disponibles
                  </td>
                </tr>
              ) : (
                verificaciones.map((verificacion: any) => (
                  <tr key={verificacion.id}>
                    <td>
                      <span className={`ver-badge ${getEstadoBadgeClass(verificacion.estado)}`}>
                        {verificacion.estado === 'pendiente' && '⏱ Pendiente'}
                        {verificacion.estado === 'verificado' && '✓ Verificado'}
                        {verificacion.estado === 'rechazado' && '✗ Rechazado'}
                      </span>
                    </td>
                    <td>{new Date(verificacion.fecha_verificacion).toLocaleDateString()}</td>
                    <td>
                      Arq. {verificacion.arquitecto?.usuario?.nombre || 'N/A'} {verificacion.arquitecto?.usuario?.apellido || ''}
                    </td>
                    <td>
                      {verificacion.arquitecto?.cedula || 'N/A'}
                    </td>
                    <td>
                      {verificacion.estado === 'pendiente' && (
                        <button
                          onClick={() => handleAprobar(verificacion.id)}
                          className="btn-aprobar"
                        >
                          Aprobar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="pagination-btn"
          >
            ← Anterior
          </button>
          <span className="pagination-info">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="pagination-btn"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </ModeratorLayout>
  );
};

import { useState, useEffect } from 'react';
import { ModeratorLayout } from '../../components/Moderator/ModeratorLayout';
import { moderadorService } from '../../services/api/moderador/moderadorService';
import { useAuth } from '../../contexts/AuthContext';
import IncidenciasTable, { type IncidenciaItem } from './components/IncidenciasTable';
import IncidenciaModals from './components/IncidenciaModals';
import '../../styles/Moderator/Incidencias.css';

type Props = Record<string, never>;

export default function Incidencias({}: Props) {
  const { user } = useAuth();
  const [incidencias, setIncidencias] = useState<IncidenciaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalDescripcion, setModalDescripcion] = useState<string | null>(null);
  const [modalSuspender, setModalSuspender] = useState<IncidenciaItem | null>(null);

  useEffect(() => {
    cargarIncidencias();
  }, [page]);

  const cargarIncidencias = async () => {
    try {
      setLoading(true);
      const response = await moderadorService.getIncidencias({ page, per_page: 10 });
      setIncidencias((response.data as unknown as IncidenciaItem[]) || []);
      setTotalPages(Math.ceil(response.total / 10) || 1);
    } catch (error) {
      console.error('[ERROR] Error al cargar incidencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolver = async (id: number) => {
    if (!confirm('¿Seguro que deseas resolver esta incidencia?')) return;

    try {
      await moderadorService.resolverIncidencia(id, {
        moderador_id: user?.id || '',
        resolucion: 'Incidencia resuelta por moderador',
      });
      alert('Incidencia resuelta exitosamente');
      cargarIncidencias();
    } catch (error) {
      console.error('[ERROR] Error al resolver:', error);
      alert('Error al resolver la incidencia');
    }
  };

  const toggleDescripcion = (descripcion: string) => {
    setModalDescripcion(descripcion);
  };

  const handleReabrir = async (id: number) => {
    if (!confirm('¿Seguro que deseas reabrir esta incidencia?')) return;

    try {
      await moderadorService.reabrirIncidencia(id, {
        moderador_id: user?.id || '',
      });
      alert('Incidencia reabierta y marcada como pendiente');
      cargarIncidencias();
    } catch (error) {
      console.error('[ERROR] Error al reabrir:', error);
      alert('Error al reabrir la incidencia');
    }
  };

  const handleCambiarEstadoUsuario = async (
    usuarioId: number | string,
    estadoActual: 'activo' | 'suspendido' | undefined
  ) => {
    const nuevoEstado = estadoActual === 'activo' ? 'suspendido' : 'activo';
    const accion = nuevoEstado === 'suspendido' ? 'suspender' : 'activar';

    try {
      if (nuevoEstado === 'suspendido') {
        await moderadorService.suspenderUsuario(usuarioId);
      } else {
        await moderadorService.activarUsuario(usuarioId);
      }
      return true;
    } catch (error) {
      console.error(`[ERROR] Error al ${accion} usuario:`, error);
      alert(`Error al ${accion} el usuario`);
      return false;
    }
  };

  const handleAplicarSuspensiones = async () => {
    if (!modalSuspender) return;

    let cambiosRealizados = false;

    if (modalSuspender.emisor && modalSuspender.emisor.estado_cuenta) {
      const emisorId = modalSuspender.emisor_id || modalSuspender.emisor.id;
      const exito = await handleCambiarEstadoUsuario(
        emisorId,
        modalSuspender.emisor.estado_cuenta === 'activo' ? 'suspendido' : 'activo'
      );
      if (exito) cambiosRealizados = true;
    }

    if (modalSuspender.infractor && modalSuspender.infractor.estado_cuenta) {
      const infractorId = modalSuspender.infractor_id || modalSuspender.infractor.id;
      const exito = await handleCambiarEstadoUsuario(
        infractorId,
        modalSuspender.infractor.estado_cuenta === 'activo' ? 'suspendido' : 'activo'
      );
      if (exito) cambiosRealizados = true;
    }

    if (cambiosRealizados) {
      alert('Cambios de estado aplicados correctamente');
      setModalSuspender(null);
      cargarIncidencias();
    }
  };

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pendiente: { label: 'Pendiente', className: 'inc-badge-warning' },
      'en revision': { label: 'En Revisión', className: 'inc-badge-info' },
      resuelto: { label: 'Resuelto', className: 'inc-badge-success' },
    };

    const badge = badges[estado] || { label: estado, className: 'inc-badge-secondary' };

    return <span className={`inc-badge ${badge.className}`}>{badge.label}</span>;
  };

  if (loading && incidencias.length === 0) {
    return (
      <ModeratorLayout>
        <div className="incidencias-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando incidencias...</p>
          </div>
        </div>
      </ModeratorLayout>
    );
  }

  return (
    <ModeratorLayout>
      <div className="incidencias-container">
        <div className="incidencias-header">
          <div>
            <h1>Gestión de Incidencias</h1>
            <p className="subtitle">Revisa y gestiona los reportes de la comunidad</p>
          </div>
        </div>

        <IncidenciasTable
          incidencias={incidencias}
          formatFecha={formatFecha}
          getEstadoBadge={getEstadoBadge}
          onToggleDescripcion={toggleDescripcion}
          onOpenSuspenderModal={(incidencia) => setModalSuspender(incidencia)}
          onResolver={handleResolver}
          onReabrir={handleReabrir}
        />

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

        <IncidenciaModals
          modalDescripcion={modalDescripcion}
          onCloseDescripcion={() => setModalDescripcion(null)}
          modalSuspender={modalSuspender}
          setModalSuspender={setModalSuspender}
          onCloseSuspender={() => setModalSuspender(null)}
          onAplicarSuspensiones={handleAplicarSuspensiones}
        />
      </div>
    </ModeratorLayout>
  );
}
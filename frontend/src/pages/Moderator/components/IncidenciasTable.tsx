import { Calendar } from 'lucide-react';

export interface IncidenciaItem {
  id: number;
  descripcion: string;
  estado: 'pendiente' | 'en revision' | 'resuelto';
  emisor_id?: number;
  infractor_id?: number;
  moderador_id: number | null;
  fecha: string;
  emisor?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    estado_cuenta?: 'activo' | 'suspendido';
  };
  infractor?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    estado_cuenta?: 'activo' | 'suspendido';
  };
  moderador?: {
    usuario: {
      nombre: string;
      apellido: string;
    };
  };
}

type Props = {
  incidencias: IncidenciaItem[];
  formatFecha: (fecha: string) => string;
  getEstadoBadge: (estado: string) => React.ReactNode;
  onToggleDescripcion: (descripcion: string) => void;
  onOpenSuspenderModal: (incidencia: IncidenciaItem) => void;
  onResolver: (id: number) => void;
  onReabrir: (id: number) => void;
};

export default function IncidenciasTable({
  incidencias,
  formatFecha,
  getEstadoBadge,
  onToggleDescripcion,
  onOpenSuspenderModal,
  onResolver,
  onReabrir,
}: Props) {
  return (
    <div className="table-responsive">
      <table className="inc-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Emisor</th>
            <th>Descripción</th>
            <th>Infractor</th>
            <th>Estado Infractor</th>
            <th>Moderador</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {incidencias.map((incidencia) => (
            <tr key={incidencia.id}>
              <td>{incidencia.id}</td>
              <td>
                <div className="fecha-cell">
                  <Calendar size={14} />
                  <span>{formatFecha(incidencia.fecha)}</span>
                </div>
              </td>
              <td>{getEstadoBadge(incidencia.estado)}</td>
              <td>
                {incidencia.emisor
                  ? `${incidencia.emisor.nombre} ${incidencia.emisor.apellido}`
                  : `Usuario ${incidencia.emisor_id}`}
              </td>
              <td className="desc-cell">
                <div className="descripcion-container">
                  <span className="descripcion-texto">
                    {incidencia.descripcion.length > 50
                      ? `${incidencia.descripcion.substring(0, 50)}...`
                      : incidencia.descripcion}
                  </span>
                  {incidencia.descripcion.length > 50 && (
                    <button
                      onClick={() => onToggleDescripcion(incidencia.descripcion)}
                      className="btn-ver-mas"
                    >
                      Ver más
                    </button>
                  )}
                </div>
              </td>
              <td>
                {incidencia.infractor
                  ? `${incidencia.infractor.nombre} ${incidencia.infractor.apellido}`
                  : `Usuario ${incidencia.infractor_id}`}
              </td>
              <td>
                {incidencia.infractor?.estado_cuenta ? (
                  <span
                    className={`inc-badge ${
                      incidencia.infractor.estado_cuenta === 'activo'
                        ? 'inc-badge-success'
                        : 'inc-badge-danger'
                    }`}
                  >
                    {incidencia.infractor.estado_cuenta === 'activo' ? 'Activo' : 'Suspendido'}
                  </span>
                ) : (
                  <span className="inc-badge inc-badge-secondary">-</span>
                )}
              </td>
              <td>
                {incidencia.moderador?.usuario
                  ? `${incidencia.moderador.usuario.nombre} ${incidencia.moderador.usuario.apellido}`
                  : '-'}
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Boolean(
                    incidencia.emisor_id ||
                      incidencia.emisor?.id ||
                      incidencia.infractor_id ||
                      incidencia.infractor?.id
                  ) && (
                    <button
                      onClick={() => onOpenSuspenderModal(incidencia)}
                      className="btn-suspender"
                      title="Gestionar suspensión de usuarios"
                    >
                      Suspender
                    </button>
                  )}
                  {incidencia.estado === 'pendiente' || incidencia.estado === 'en revision' ? (
                    <button
                      onClick={() => onResolver(incidencia.id)}
                      className="btn-resolver"
                    >
                      Resolver
                    </button>
                  ) : incidencia.estado === 'resuelto' ? (
                    <button
                      onClick={() => onReabrir(incidencia.id)}
                      className="btn-reabrir"
                    >
                      Reabrir
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

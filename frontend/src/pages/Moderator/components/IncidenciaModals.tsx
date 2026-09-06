import type { IncidenciaItem } from './IncidenciasTable';

type Props = {
  modalDescripcion: string | null;
  onCloseDescripcion: () => void;
  modalSuspender: IncidenciaItem | null;
  setModalSuspender: React.Dispatch<React.SetStateAction<IncidenciaItem | null>>;
  onCloseSuspender: () => void;
  onAplicarSuspensiones: () => void;
};

export default function IncidenciaModals({
  modalDescripcion,
  onCloseDescripcion,
  modalSuspender,
  setModalSuspender,
  onCloseSuspender,
  onAplicarSuspensiones,
}: Props) {
  return (
    <>
      {/* Modal para descripción completa */}
      {modalDescripcion && (
        <div className="inc-modal-overlay" onClick={onCloseDescripcion}>
          <div className="inc-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="inc-modal-header">
              <h3>Descripción Completa</h3>
              <button className="inc-modal-close" onClick={onCloseDescripcion}>
                ×
              </button>
            </div>
            <div className="inc-modal-body">
              <p>{modalDescripcion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal para suspender/activar usuarios */}
      {modalSuspender && (
        <div className="inc-modal-overlay" onClick={onCloseSuspender}>
          <div className="inc-modal-content inc-modal-suspender" onClick={(e) => e.stopPropagation()}>
            <div className="inc-modal-header">
              <h3>Gestionar Suspensión de Usuarios</h3>
              <button className="inc-modal-close" onClick={onCloseSuspender}>
                ×
              </button>
            </div>
            <div className="inc-modal-body">
              <div className="suspender-usuarios-list">
                {modalSuspender.emisor && (
                  <div className="suspender-usuario-item">
                    <div className="suspender-usuario-info">
                      <h4>Usuario Emisor</h4>
                      <p>
                        {modalSuspender.emisor.nombre} {modalSuspender.emisor.apellido}
                      </p>
                      <p className="suspender-usuario-email">{modalSuspender.emisor.email}</p>
                      <span
                        className={`inc-badge ${
                          modalSuspender.emisor.estado_cuenta === 'activo'
                            ? 'inc-badge-success'
                            : 'inc-badge-danger'
                        }`}
                      >
                        {modalSuspender.emisor.estado_cuenta === 'activo' ? 'Activo' : 'Suspendido'}
                      </span>
                    </div>
                    <div className="suspender-usuario-actions">
                      <button
                        onClick={() => {
                          setModalSuspender({
                            ...modalSuspender,
                            emisor: {
                              ...modalSuspender.emisor!,
                              estado_cuenta:
                                modalSuspender.emisor!.estado_cuenta === 'activo'
                                  ? 'suspendido'
                                  : 'activo',
                            },
                          });
                        }}
                        className={
                          modalSuspender.emisor.estado_cuenta === 'activo'
                            ? 'btn-suspender'
                            : 'btn-activar'
                        }
                      >
                        {modalSuspender.emisor.estado_cuenta === 'activo' ? 'Suspender' : 'Activar'}
                      </button>
                    </div>
                  </div>
                )}

                {modalSuspender.infractor && (
                  <div className="suspender-usuario-item">
                    <div className="suspender-usuario-info">
                      <h4>Usuario Infractor</h4>
                      <p>
                        {modalSuspender.infractor.nombre} {modalSuspender.infractor.apellido}
                      </p>
                      <p className="suspender-usuario-email">{modalSuspender.infractor.email}</p>
                      <span
                        className={`inc-badge ${
                          modalSuspender.infractor.estado_cuenta === 'activo'
                            ? 'inc-badge-success'
                            : 'inc-badge-danger'
                        }`}
                      >
                        {modalSuspender.infractor.estado_cuenta === 'activo' ? 'Activo' : 'Suspendido'}
                      </span>
                    </div>
                    <div className="suspender-usuario-actions">
                      <button
                        onClick={() => {
                          setModalSuspender({
                            ...modalSuspender,
                            infractor: {
                              ...modalSuspender.infractor!,
                              estado_cuenta:
                                modalSuspender.infractor!.estado_cuenta === 'activo'
                                  ? 'suspendido'
                                  : 'activo',
                            },
                          });
                        }}
                        className={
                          modalSuspender.infractor.estado_cuenta === 'activo'
                            ? 'btn-suspender'
                            : 'btn-activar'
                        }
                      >
                        {modalSuspender.infractor.estado_cuenta === 'activo' ? 'Suspender' : 'Activar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="inc-modal-footer">
              <button className="btn-cancelar" onClick={onCloseSuspender}>
                Cancelar
              </button>
              <button className="btn-aplicar" onClick={onAplicarSuspensiones}>
                Aplicar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

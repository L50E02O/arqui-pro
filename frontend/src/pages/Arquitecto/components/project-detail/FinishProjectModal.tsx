import { X, CheckCircle } from 'lucide-react';

type Props = {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  finishingProject: boolean;
};

export default function FinishProjectModal({
  show,
  onClose,
  onConfirm,
  finishingProject,
}: Props) {
  if (!show) return null;

  return (
    <div className="apd-modal-overlay" onClick={onClose}>
      <div className="apd-modal-content apd-modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="apd-modal-header">
          <h3>Finalizar Proyecto</h3>
          <button onClick={onClose} className="btn-close-modal">
            <X size={20} />
          </button>
        </div>

        <div className="apd-modal-body">
          <div className="confirm-icon">
            <CheckCircle size={48} />
          </div>
          <p className="confirm-message">
            ¿Estás seguro de que deseas finalizar este proyecto?
          </p>
          <p className="confirm-description">
            Al finalizar el proyecto, este pasará a formar parte de tu portafolio 
            y ya no podrás crear más avances. Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn-cancel"
            disabled={finishingProject}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-finish"
            disabled={finishingProject}
          >
            {finishingProject ? 'Finalizando...' : 'Finalizar Proyecto'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { Calendar, Trash2 } from 'lucide-react';
import type { Avance } from '../../../../types/avance.types';

type Props = {
  avances: Avance[];
  formatDate: (dateString: string) => string;
  onDeleteAvance: (avanceId: string) => void;
  tipoProyecto: 'portafolio' | 'contratado';
  canCreateAvance: boolean;
  onOpenCreateModal: () => void;
};

export default function AvancesTimeline({
  avances,
  formatDate,
  onDeleteAvance,
  tipoProyecto,
  canCreateAvance,
  onOpenCreateModal,
}: Props) {
  if (avances.length === 0) {
    return (
      <div className="empty-state">
        <Calendar size={48} />
        <p>
          {tipoProyecto === 'portafolio'
            ? 'No hay imágenes en la galería'
            : 'No hay avances registrados'}
        </p>
        {canCreateAvance && (
          <button onClick={onOpenCreateModal} className="btn-create-first">
            Crear primer avance
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="avances-timeline">
      {avances.map((avance, index) => (
        <div key={avance.id} className="avance-item">
          <div className="avance-marker">
            <div className="marker-dot"></div>
            {index < avances.length - 1 && <div className="marker-line"></div>}
          </div>
          <div className="avance-content">
            <div className="avance-header">
              <div className="avance-date">
                <Calendar size={16} />
                <span>{formatDate(avance.fecha)}</span>
              </div>
              <button
                onClick={() => onDeleteAvance(avance.id)}
                className="btn-delete-avance"
                title="Eliminar avance"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <p className="avance-description">{avance.descripcion}</p>

            {avance.imagenes && avance.imagenes.length > 0 && (
              <div className="avance-images">
                {avance.imagenes.map((imagen, imgIndex) => (
                  <div key={imagen.id || imgIndex} className="avance-image-item">
                    <img src={imagen.imagen_url} alt={`Avance ${imgIndex + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

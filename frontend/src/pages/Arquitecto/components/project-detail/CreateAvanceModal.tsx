import React from 'react';
import { X, ImageIcon } from 'lucide-react';

type Props = {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newAvance: {
    fecha: string;
    descripcion: string;
  };
  setNewAvance: React.Dispatch<React.SetStateAction<{ fecha: string; descripcion: string }>>;
  creatingAvance: boolean;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagesPreviews: string[];
  removeImage: (index: number) => void;
};

export default function CreateAvanceModal({
  show,
  onClose,
  onSubmit,
  newAvance,
  setNewAvance,
  creatingAvance,
  handleImageSelect,
  imagesPreviews,
  removeImage,
}: Props) {
  if (!show) return null;

  return (
    <div className="apd-modal-overlay" onClick={onClose}>
      <div className="apd-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="apd-modal-header">
          <h3>Nuevo Avance</h3>
          <button onClick={onClose} className="btn-close-modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="avance-form">
          <div className="form-group">
            <label htmlFor="fecha">Fecha</label>
            <input
              type="date"
              id="fecha"
              value={newAvance.fecha}
              onChange={(e) => setNewAvance({ ...newAvance, fecha: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción del Avance</label>
            <textarea
              id="descripcion"
              value={newAvance.descripcion}
              onChange={(e) => setNewAvance({ ...newAvance, descripcion: e.target.value })}
              placeholder="Describe el progreso realizado..."
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label>Imágenes (opcional)</label>
            <div className="image-upload-area">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                id="image-upload"
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="btn-upload">
                <ImageIcon size={20} />
                <span>Seleccionar imágenes</span>
              </label>
            </div>

            {imagesPreviews.length > 0 && (
              <div className="images-preview-grid">
                {imagesPreviews.map((preview, index) => (
                  <div key={index} className="preview-image-item">
                    <img src={preview} alt={`Preview ${index}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="btn-remove-preview"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={creatingAvance}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={creatingAvance || !newAvance.descripcion.trim()}
            >
              {creatingAvance ? 'Creando...' : 'Crear Avance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

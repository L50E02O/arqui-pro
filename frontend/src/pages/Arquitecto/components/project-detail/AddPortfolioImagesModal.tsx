import React from 'react';
import { X, ImageIcon } from 'lucide-react';

type Props = {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  uploadingImages: boolean;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagesPreviews: string[];
  removeImage: (index: number) => void;
  selectedImagesCount: number;
};

export default function AddPortfolioImagesModal({
  show,
  onClose,
  onSubmit,
  uploadingImages,
  handleImageSelect,
  imagesPreviews,
  removeImage,
  selectedImagesCount,
}: Props) {
  if (!show) return null;

  return (
    <div className="apd-modal-overlay" onClick={onClose}>
      <div className="apd-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="apd-modal-header">
          <h3>Agregar Imágenes a la Galería</h3>
          <button onClick={onClose} className="btn-close-modal">
            <X size={20} />
          </button>
        </div>

        <div className="apd-modal-body">
          <div className="form-group">
            <label>Imágenes</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              id="portfolio-image-upload"
              style={{ display: 'none' }}
            />
            <label htmlFor="portfolio-image-upload" className="btn-upload">
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
            disabled={uploadingImages}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="btn-submit"
            disabled={uploadingImages || selectedImagesCount === 0}
          >
            {uploadingImages ? 'Agregando...' : 'Agregar Imágenes'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { MapPin, FileText } from 'lucide-react';

type Props = {
  ubicacion: string;
  descripcion: string;
  especialidades: string[];
  especialidadesOpciones: string[];
  showEspecialidadesDropdown: boolean;
  setShowEspecialidadesDropdown: (show: boolean) => void;
  especialidadesRef: React.RefObject<HTMLDivElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onToggleEspecialidad: (esp: string) => void;
};

export default function ArquitectoProfessionalFields({
  ubicacion,
  descripcion,
  especialidades,
  especialidadesOpciones,
  showEspecialidadesDropdown,
  setShowEspecialidadesDropdown,
  especialidadesRef,
  onChange,
  onToggleEspecialidad,
}: Props) {
  return (
    <>
      {/* 3ra Fila: Especialidades y Ubicacion */}
      <div className="fra-input-row">
        <div className="fra-input-group" ref={especialidadesRef}>
          <label className="fra-input-label">Especialidades</label>
          <div className="fra-especialidades-container">
            <button
              type="button"
              className="fra-especialidades-btn"
              onClick={() => setShowEspecialidadesDropdown(!showEspecialidadesDropdown)}
            >
              <span className="fra-especialidades-text">
                {especialidades.length === 0
                  ? 'Selecciona tus especialidades'
                  : `${especialidades.length} seleccionada(s)`}
              </span>
            </button>

            {showEspecialidadesDropdown && (
              <div className="fra-especialidades-dropdown">
                {especialidadesOpciones.map((esp) => (
                  <label key={esp} className="fra-checkbox-label">
                    <input
                      type="checkbox"
                      checked={especialidades.includes(esp)}
                      onChange={() => onToggleEspecialidad(esp)}
                      className="fra-checkbox-input"
                    />
                    <span>{esp}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="fra-input-group">
          <label htmlFor="ubicacion" className="fra-input-label">Ubicación</label>
          <div className="fra-input-with-icon">
            <MapPin className="fra-input-start-icon" size={20} color="#adb5bd" />
            <input
              className="fra-form-input"
              type="text"
              id="ubicacion"
              placeholder="Ej: Ciudad de México, México"
              value={ubicacion}
              onChange={onChange}
              required
            />
          </div>
        </div>
      </div>

      {/* 4ta Fila: Descripcion */}
      <div className="fra-input-group">
        <label htmlFor="descripcion" className="fra-input-label">Descripción Profesional</label>
        <div className="fra-textarea-with-icon">
          <FileText className="fra-input-start-icon" size={20} color="#adb5bd" />
          <textarea
            className="fra-form-textarea"
            id="descripcion"
            placeholder="Cuéntanos sobre tu experiencia, estilo arquitectónico y enfoque de diseño..."
            value={descripcion}
            onChange={onChange}
            required
            rows={4}
          />
        </div>
      </div>
    </>
  );
}

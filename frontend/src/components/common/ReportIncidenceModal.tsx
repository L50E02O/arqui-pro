import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import '../../styles/ReportIncidenceModal.css'

type ImagePreview = {
  id: string
  file: File
  preview: string
  uploading?: boolean
  error?: string
}

type Props = {
  visible: boolean
  onClose: () => void
  onSubmit: (data: { descripcion: string; imagenes: File[] }) => Promise<void>
}

export default function ReportIncidenceModal({ visible, onClose, onSubmit }: Props) {
  const [descripcion, setDescripcion] = useState('')
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([])
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!visible) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    Array.from(e.target.files).forEach((file) => {
      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten archivos de imagen')
        return
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe exceder 5MB')
        return
      }

      // Crear preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const preview: ImagePreview = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview: event.target?.result as string,
        }
        setImagePreviews((prev) => [...prev, preview])
      }
      reader.readAsDataURL(file)
    })

    // Limpiar input
    e.target.value = ''
  }

  const handleRemoveImage = (id: string) => {
    setImagePreviews((prev) => prev.filter((img) => img.id !== id))
  }

  const handleClickFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async () => {
    if (!descripcion.trim()) {
      alert('Por favor escribe una descripción')
      return
    }

    setSubmitting(true)
    try {
      const files = imagePreviews.map((img) => img.file)
      await onSubmit({ descripcion: descripcion.trim(), imagenes: files })
      // Limpiar
      setDescripcion('')
      setImagePreviews([])
      onClose()
    } catch (e: any) {
      alert('Error al enviar el reporte: ' + (e?.message || e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rim-overlay">
      <div className="rim-modal">
        <div className="rim-header">
          <h3>Reportar Arquitecto</h3>
          <button className="rim-close" onClick={onClose} disabled={submitting}>
            &times;
          </button>
        </div>
        <div className="rim-body">
          <label>Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={5}
            disabled={submitting}
            placeholder="Describe el problema o la razón del reporte..."
          />

          <label>Imágenes (opcional)</label>
          <div className="rim-file-input-wrapper">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={submitting}
              className="rim-file-input"
            />
            <span className="rim-file-label" onClick={handleClickFileInput} role="button" tabIndex={0}>
              Seleccionar imágenes
            </span>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="rim-image-previews">
              <h4>Imágenes seleccionadas ({imagePreviews.length})</h4>
              <div className="rim-preview-grid">
                {imagePreviews.map((img) => (
                  <div key={img.id} className="rim-preview-item">
                    <img src={img.preview} alt="preview" />
                    <button
                      type="button"
                      className="rim-preview-remove"
                      onClick={() => handleRemoveImage(img.id)}
                      disabled={submitting}
                      title="Eliminar imagen"
                    >
                      <X size={16} />
                    </button>
                    {img.uploading && <div className="rim-preview-loading">Subiendo...</div>}
                    {img.error && <div className="rim-preview-error">{img.error}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="rim-footer">
          <button className="rim-cancel" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button className="rim-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar reporte'}
          </button>
        </div>
      </div>
    </div>
  )
}

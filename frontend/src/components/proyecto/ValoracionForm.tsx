import { useState } from 'react'
import { Star } from 'lucide-react'
import validacionesService from '../../services/api/validacionesService'
import type { Proyecto } from '../../types/proyecto.types'
import type { Cliente } from '../../types/cliente.types'
import '../../styles/ValoracionForm.css'

type Props = {
  proyecto: Proyecto
  cliente: Cliente | null
  onValoracionCreada?: () => void
}

export default function ValoracionForm({ proyecto, cliente, onValoracionCreada }: Props) {
  const [calificacion, setCalificacion] = useState<number>(0)
  const [comentario, setComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Solo mostrar el form si el cliente es el dueño del proyecto
  if (!cliente || proyecto.cliente_id !== cliente.id) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (calificacion === 0) {
      setError('Por favor selecciona una calificación')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Crear la valoración
      const nuevaValoracion = await validacionesService.create({
        calificacion,
        comentario: comentario.trim() || null,
        fecha: new Date().toISOString(),
        cliente_id: cliente.id,
        proyecto_id: proyecto.id
      })

      console.log('✅ Valoración creada:', nuevaValoracion)

      // Limpiar form
      setCalificacion(0)
      setComentario('')
      setSuccess(true)

      // Llamar callback si existe
      if (onValoracionCreada) {
        onValoracionCreada()
      }

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error al crear valoración:', err)
      setError(err?.response?.data?.error || 'No se pudo crear la valoración')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="vf-container">
      <h3 className="vf-title">Califica este proyecto</h3>

      <form onSubmit={handleSubmit} className="vf-form">
        {/* Calificación con estrellas */}
        <div className="vf-rating-section">
          <label className="vf-label">Calificación</label>
          <div className="vf-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`vf-star ${calificacion >= star ? 'active' : ''}`}
                onClick={() => setCalificacion(star)}
                title={`${star} estrella${star > 1 ? 's' : ''}`}
              >
                <Star size={32} fill={calificacion >= star ? '#ff6b35' : 'none'} />
              </button>
            ))}
          </div>
          {calificacion > 0 && <span className="vf-rating-text">{calificacion} de 5</span>}
        </div>

        {/* Comentario */}
        <div className="vf-comment-section">
          <label className="vf-label" htmlFor="comentario">
            Comentario (opcional)
          </label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Comparte tu opinión sobre este proyecto..."
            rows={4}
            maxLength={500}
            disabled={submitting}
            className="vf-textarea"
          />
          <span className="vf-char-count">{comentario.length}/500</span>
        </div>

        {/* Mensajes */}
        {error && <div className="vf-error">{error}</div>}
        {success && <div className="vf-success">✅ Valoración creada exitosamente</div>}

        {/* Botón submit */}
        <button type="submit" disabled={submitting || calificacion === 0} className="vf-submit">
          {submitting ? 'Guardando...' : 'Enviar valoración'}
        </button>
      </form>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Star, Trash2 } from 'lucide-react'
import validacionesService from '../../services/api/validacionesService'
import type { Valoracion } from '../../types/valoracion.types'
import type { Cliente } from '../../types/cliente.types'
import '../../styles/ValoracionesList.css'

type Props = {
  proyectoId: string
  cliente: Cliente | null
  refreshTrigger?: number
}

export default function ValoracionesList({ proyectoId, cliente, refreshTrigger }: Props) {
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [promedio, setPromedio] = useState<number>(0)

  const fetchValoraciones = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await validacionesService.getByProyecto(proyectoId)
      setValoraciones(data)

      // Calcular promedio
      if (data.length > 0) {
        const avg = data.reduce((acc, val) => acc + val.calificacion, 0) / data.length
        setPromedio(Number(avg.toFixed(2)))
      } else {
        setPromedio(0)
      }
    } catch (err: any) {
      console.error('Error al obtener valoraciones:', err)
      setError('No se pudieron cargar las valoraciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchValoraciones()
  }, [proyectoId, refreshTrigger])

  const handleDelete = async (valoracionId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta valoración?')) {
      return
    }

    setDeletingId(valoracionId)
    try {
      await validacionesService.delete(valoracionId)
      console.log('✅ Valoración eliminada')
      
      // Refrescar lista
      await fetchValoraciones()
    } catch (err: any) {
      console.error('Error al eliminar valoración:', err)
      setError('No se pudo eliminar la valoración')
    } finally {
      setDeletingId(null)
    }
  }

  const renderStars = (calificacion: number) => {
    return (
      <div className="vl-stars-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={calificacion >= star ? '#ff6b35' : '#e0e0e0'}
            color={calificacion >= star ? '#ff6b35' : '#e0e0e0'}
          />
        ))}
      </div>
    )
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="vl-loading">Cargando valoraciones...</div>
  }

  return (
    <div className="vl-container">
      <div className="vl-header">
        <div>
          <h3 className="vl-title">Valoraciones del Proyecto</h3>
          {promedio > 0 && (
            <div className="vl-promedio">
              <span className="vl-promedio-label">Calificación promedio:</span>
              <div className="vl-promedio-value">
                <span className="vl-score">{promedio}</span>
                <div className="vl-promedio-stars">
                  {renderStars(Math.round(promedio))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="vl-count">
          {valoraciones.length > 0 && (
            <span className="vl-badge">{valoraciones.length} valoración{valoraciones.length > 1 ? 'es' : ''}</span>
          )}
        </div>
      </div>

      {error && <div className="vl-error">{error}</div>}

      {valoraciones.length === 0 ? (
        <div className="vl-empty">
          <p>Aún no hay valoraciones para este proyecto</p>
        </div>
      ) : (
        <div className="vl-list">
          {valoraciones.map((valoracion) => {
            const esDelCliente = cliente && valoracion.cliente_id === cliente.id
            return (
              <div key={valoracion.id} className="vl-item">
                <div className="vl-item-header">
                  <div className="vl-item-info">
                    <h4 className="vl-item-cliente">
                      {valoracion.cliente?.usuario?.nombre || 'Cliente Anónimo'}
                    </h4>
                    <span className="vl-item-fecha">{formatFecha(valoracion.fecha)}</span>
                  </div>
                  {esDelCliente && (
                    <div className="vl-item-actions">
                      <button
                        className="vl-delete-btn"
                        onClick={() => handleDelete(valoracion.id)}
                        disabled={deletingId === valoracion.id}
                        title="Eliminar valoración"
                      >
                        <Trash2 size={16} />
                        {deletingId === valoracion.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="vl-item-rating">
                  {renderStars(valoracion.calificacion)}
                  <span className="vl-item-score">{valoracion.calificacion}/5</span>
                </div>

                {valoracion.comentario && (
                  <p className="vl-item-comment">{valoracion.comentario}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

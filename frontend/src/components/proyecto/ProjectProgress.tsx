import { Calendar, FileText } from 'lucide-react'
import type { Avance } from '../../types'
import '../../styles/ProjectProgress.css'

interface ProjectProgressProps {
  avances: Avance[]
}

function ProjectProgress({ avances }: ProjectProgressProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!avances || avances.length === 0) {
    return (
      <div className="progress-empty">
        <FileText size={48} className="empty-icon" />
        <p>No hay avances registrados para este proyecto.</p>
      </div>
    )
  }

  // Ordenar avances por fecha (más reciente primero)
  const sortedAvances = [...avances].sort((a, b) => {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  })

  return (
    <div className="project-progress">
      <div className="progress-list">
        {sortedAvances.map((avance) => (
          <div key={avance.id} className="progress-item">
            <div className="progress-timeline-marker">
              <div className="timeline-dot"></div>
              <div className="timeline-line"></div>
            </div>

            <div className="progress-card">
              <div className="progress-header">
                <div className="progress-date">
                  <Calendar size={18} />
                  <span>{formatDate(avance.fecha)}</span>
                </div>
              </div>

              <div className="progress-content">
                {avance.imagenes && avance.imagenes.length > 0 && (
                  <div className="progress-images">
                    {avance.imagenes.map((imagen, index) => (
                      <div key={index} className="progress-image-wrapper">
                        <img
                          src={imagen.imagen_url}
                          alt={`Avance ${formatDate(avance.fecha)}`}
                          className="progress-image"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="progress-description">
                  <h3 className="progress-title">Descripción del Avance</h3>
                  <p>{avance.descripcion}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectProgress

import type { Proyecto } from '../../types'
import '../../styles/ImageGallery.css'

interface ImageGalleryProps {
  proyecto: Proyecto
}

function ImageGallery({ proyecto }: ImageGalleryProps) {
  // Recolectar todas las imágenes del proyecto y de los avances
  const allImages: Array<{ url: string; fecha: string; source: string }> = []

  // Agregar imágenes del proyecto
  if (proyecto.imagenes && proyecto.imagenes.length > 0) {
    proyecto.imagenes.forEach((imagen) => {
      allImages.push({
        url: imagen.imagen_url,
        fecha: imagen.fecha,
        source: 'Proyecto'
      })
    })
  }

  // Agregar imágenes de los avances
  if (proyecto.avances && proyecto.avances.length > 0) {
    proyecto.avances.forEach((avance) => {
      if (avance.imagenes && avance.imagenes.length > 0) {
        avance.imagenes.forEach((imagen) => {
          allImages.push({
            url: imagen.imagen_url,
            fecha: imagen.fecha,
            source: `Avance`
          })
        })
      }
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (allImages.length === 0) {
    return (
      <div className="image-gallery-empty">
        <p>No hay imágenes disponibles para este proyecto.</p>
      </div>
    )
  }

  return (
    <div className="image-gallery">
      <div className="gallery-grid">
        {allImages.map((image, index) => (
          <div key={index} className="gallery-item">
            <div className="gallery-image-wrapper">
              <img
                src={image.url}
                alt={`${image.source} - ${formatDate(image.fecha)}`}
                className="gallery-image"
              />
              <div className="gallery-overlay">
                <span className="gallery-source">{image.source}</span>
                <span className="gallery-date">{formatDate(image.fecha)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageGallery

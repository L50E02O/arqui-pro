import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SolicitudProyecto } from '../../types'
import '../../styles/TarjetaSolicitud.css'

interface TarjetaSolicitudProps {
  solicitud: SolicitudProyecto
}

const ESTADO_CONFIG = {
  pendiente: {
    label: 'Pendiente',
    className: 'estado-pendiente',
    badge: 'Awaiting Info'
  },
  aceptado: {
    label: 'Activo',
    className: 'estado-activo',
    badge: 'Active'
  },
  rechazado: {
    label: 'Cerrado',
    className: 'estado-cerrado',
    badge: 'Closed'
  }
} as const

const TarjetaSolicitud = memo(function TarjetaSolicitud({ solicitud }: TarjetaSolicitudProps) {
  const navigate = useNavigate()
  
  const {
    id,
    titulo_proyecto,
    estado,
    descripcion,
    proyecto
  } = solicitud

  const handleClick = () => {
    navigate(`/cliente/solicitud/${id}`)
  }

  const estadoInfo = ESTADO_CONFIG[estado]
  
  // Calcular tiempo desde la publicación (simulado)
  const tiempoPublicacion = 'hace 3 días' // Esto debería calcularse desde created_at

  return (
    <div className="tarjeta-solicitud" onClick={handleClick}>
      <div className="tarjeta-solicitud-header">
        <h3 className="tarjeta-solicitud-titulo">{titulo_proyecto}</h3>
        <span className={`tarjeta-solicitud-badge ${estadoInfo.className}`}>
          {estadoInfo.badge}
        </span>
      </div>
      
      <p className="tarjeta-solicitud-estado">
        Estado: <strong>{estadoInfo.label}</strong>
      </p>
      
      {estado === 'pendiente' && descripcion && (
        <p className="tarjeta-solicitud-info">
          {descripcion.length > 50 ? `${descripcion.substring(0, 50)}...` : descripcion}
        </p>
      )}
      
      {estado === 'aceptado' && proyecto && (
        <p className="tarjeta-solicitud-info">
          El arquitecto requiere más detalles
        </p>
      )}
      
      {estado === 'rechazado' && (
        <p className="tarjeta-solicitud-info">
          Arquitecto contratado
        </p>
      )}
      
      <p className="tarjeta-solicitud-tiempo">
        Publicado: {tiempoPublicacion}
      </p>
    </div>
  )
})

export default TarjetaSolicitud

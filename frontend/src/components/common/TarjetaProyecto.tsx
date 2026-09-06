import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Proyecto } from '../../types'
import '../../styles/TarjetaProyecto.css'

interface TarjetaProyectoProps {
  proyecto: Proyecto
}

const TarjetaProyecto = memo(function TarjetaProyecto({ proyecto }: TarjetaProyectoProps) {
  const navigate = useNavigate()
  
  const {
    id,
    titulo_proyecto,
    arquitecto,
    imagenes
  } = proyecto

  const handleClick = () => {
    navigate(`/cliente/proyecto/${id}`)
  }

  // Obtener la primera imagen del proyecto
  const imagenPrincipal = imagenes?.[0]?.imagen_url || '/placeholder-project.jpg'
  
  // Obtener nombre del arquitecto
  const nombreArquitecto = arquitecto && arquitecto.usuario
    ? `${arquitecto.usuario.nombre} ${arquitecto.usuario.apellido}`
    : (arquitecto?.ubicacion || 'Arquitecto')

  return (
    <div className="tarjeta-proyecto" onClick={handleClick}>
      <div className="tarjeta-proyecto-imagen">
        <img src={imagenPrincipal} alt={titulo_proyecto} />
        <div className="tarjeta-proyecto-overlay">
          <h3 className="tarjeta-proyecto-titulo">{titulo_proyecto}</h3>
          <p className="tarjeta-proyecto-arquitecto">por {nombreArquitecto}</p>
        </div>
      </div>
    </div>
  )
})

export default TarjetaProyecto

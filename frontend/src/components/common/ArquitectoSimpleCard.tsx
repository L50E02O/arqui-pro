import { useNavigate, useLocation } from 'react-router-dom'
import '../../styles/ArquitectoCard.css'

interface ArquitectoSimpleCardProps {
  id: number
  nombre: string
  apellido: string
  especialidades: string
  valoracionPromedioProyecto: number
  fotoPerfil?: string | null
}

// Colores aleatorios para avatares
const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#6C5CE7', '#FDA7DF', '#F8B500',
  '#95E1D3', '#F38181'
]

function ArquitectoSimpleCard({ 
  id,
  nombre, 
  apellido, 
  especialidades, 
  valoracionPromedioProyecto,
  fotoPerfil 
}: ArquitectoSimpleCardProps) {
  const nombreCompleto = `${nombre} ${apellido}`
  const iniciales = `${nombre[0]}${apellido[0]}`
  const navigate = useNavigate();
  const location = useLocation();
  // Generar color basado en el nombre
  const getAvatarColor = (name: string) => {
    const index = name.charCodeAt(0) % AVATAR_COLORS.length
    return AVATAR_COLORS[index]
  }

  const avatarColor = getAvatarColor(nombreCompleto)
  
  // Especialidades viene como string separado por comas
  const especialidadPrincipal = especialidades 
    ? especialidades.split(',')[0].trim() 
    : 'Arquitecto'

  const handleVerPerfil = () => {
    if(location.pathname === "/architects"){
      navigate(`/architect/${id}`);
    }else{
      navigate(`/cliente/arquitecto/${id}`);
    }
  }
  return (
    <div className="arquitecto-card arquitecto-card-simple">
      <div className="arquitecto-avatar" style={{ backgroundColor: avatarColor }}>
        {fotoPerfil ? (
          <img src={fotoPerfil} alt={nombreCompleto} />
        ) : (
          <span className="avatar-initials">{iniciales}</span>
        )}
      </div>
      
      <div className="arquitecto-info">
        <h3 className="arquitecto-name">{nombreCompleto}</h3>
        <p className="arquitecto-specialty">{especialidadPrincipal}</p>
        
        <div className="arquitecto-rating">
          <span className="rating-star">⭐</span>
          <span className="rating-value">{valoracionPromedioProyecto.toFixed(1)}</span>
        </div>
      </div>
            <button
        onClick={handleVerPerfil}
        className="arquitecto-button"
      >
        Ver Perfil
      </button>
    </div>
  )
}

export default ArquitectoSimpleCard

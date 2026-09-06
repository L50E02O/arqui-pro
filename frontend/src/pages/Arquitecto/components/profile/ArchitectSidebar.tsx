import { Star, FolderKanban, Eye, MapPin, MessageCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Arquitecto } from '../../../../types';

type Props = {
  arquitecto: Arquitecto;
  nombreCompleto: string;
  iniciales: string;
  avatarColor: string;
  especialidadesList: string[];
  totalProyectos: number;
  promedioValoracion: number;
  valoracionesConnected: boolean;
  creatingConversation: boolean;
  canReport: boolean;
  onContactar: () => void;
  onReportar: () => void;
};

export default function ArchitectSidebar({
  arquitecto,
  nombreCompleto,
  iniciales,
  avatarColor,
  especialidadesList,
  totalProyectos,
  promedioValoracion,
  valoracionesConnected,
  creatingConversation,
  canReport,
  onContactar,
  onReportar,
}: Props) {
  return (
    <div className="profile-sidebar">
      {/* Avatar y Nombre */}
      <div className="sidebar-header">
        <div className="profile-avatar-large" style={{ backgroundColor: avatarColor }}>
          {arquitecto.usuario?.foto_perfil ? (
            <img src={arquitecto.usuario.foto_perfil} alt={nombreCompleto} />
          ) : (
            <span className="avatar-initials-large">{iniciales}</span>
          )}
        </div>

        <h1 className="profile-name">{nombreCompleto}</h1>

        {arquitecto.verificado && (
          <span className="verified-badge">
            <CheckCircle size={18} />
            Verificado
          </span>
        )}
      </div>

      {/* Estadísticas */}
      <div className="profile-stats">
        <div className="stat-item">
          <Star className="stat-icon" size={28} />
          <span className="stat-value">{promedioValoracion.toFixed(1)}</span>
          <span className="stat-label">
            Valoración
            {valoracionesConnected && (
              <span className="ws-status ws-connected" title="Actualización en tiempo real activa">●</span>
            )}
          </span>
        </div>
        <div className="stat-item">
          <FolderKanban className="stat-icon" size={28} />
          <span className="stat-value">{totalProyectos}</span>
          <span className="stat-label">Proyectos</span>
        </div>
        <div className="stat-item">
          <Eye className="stat-icon" size={28} />
          <span className="stat-value">{arquitecto.vistas_perfil}</span>
          <span className="stat-label">Vistas</span>
        </div>
      </div>

      {/* Ubicación */}
      {arquitecto.ubicacion && (
        <div className="sidebar-section">
          <div className="profile-location">
            <MapPin className="location-icon" size={20} />
            <span>{arquitecto.ubicacion}</span>
          </div>
        </div>
      )}

      {/* Botón Contactar */}
      <button
        className="contact-button"
        onClick={onContactar}
        disabled={creatingConversation}
      >
        <MessageCircle size={20} />
        {creatingConversation ? 'Creando conversación...' : 'Contactar Arquitecto'}
      </button>

      {/* Botón Reportar (solo clientes logueados) */}
      {canReport && (
        <button className="report-button" onClick={onReportar}>
          <AlertTriangle size={16} />
          Reportar Arquitecto
        </button>
      )}

      {/* Especialidades */}
      {especialidadesList.length > 0 && (
        <div className="sidebar-section">
          <h3 className="sidebar-title">Especialidades</h3>
          <div className="especialidades-list">
            {especialidadesList.map((especialidad, index) => (
              <span key={index} className="especialidad-tag">{especialidad}</span>
            ))}
          </div>
        </div>
      )}

      {/* Descripción */}
      {arquitecto.descripcion && (
        <div className="sidebar-section">
          <h3 className="sidebar-title">Acerca de</h3>
          <p className="profile-description">{arquitecto.descripcion}</p>
        </div>
      )}

      {/* Información Profesional */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">Información Profesional</h3>
        <div className="info-list">
          <div className="info-item">
            <span className="info-label">Cédula Profesional</span>
            <span className="info-value">{arquitecto.cedula}</span>
          </div>
          {arquitecto.usuario?.email && (
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{arquitecto.usuario.email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

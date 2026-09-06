import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { MessageCircle, User, Settings, LogOut } from 'lucide-react';
import arquitectosService from '../../services/api/arquitectosService';
import type { Arquitecto } from '../../types';
import { getInitials, getAvatarColor } from '../../utils/formatters';
import { AVATAR_COLORS } from '../../config/constants';
import '../../styles/ArchitectOwnProfile.css';

export default function ArchitectOwnProfile() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [arquitecto, setArquitecto] = useState<Arquitecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    if (user.rol !== 'arquitecto') {
      navigate('/');
      return;
    }

    const fetchArquitecto = async () => {
      try {
        setLoading(true);
        // Buscar el arquitecto por usuario_id
        // Primero intentamos obtener todos y filtrar, o mejor aún, crear un endpoint específico
        const response = await arquitectosService.getAll();
        const arquitectoEncontrado = response.find(
          (arq) => arq.usuario_id === user.id || arq.usuario?.id === user.id
        );

        if (arquitectoEncontrado) {
          setArquitecto(arquitectoEncontrado);
        } else {
          setError('No se encontró el perfil de arquitecto asociado');
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchArquitecto();
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="architect-own-profile-loading">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error || !arquitecto) {
    return (
      <div className="architect-own-profile-error">
        <p>{error || 'Perfil no encontrado'}</p>
        <button onClick={() => navigate('/')}>Volver al inicio</button>
      </div>
    );
  }

  const nombreCompleto = arquitecto.usuario
    ? `${arquitecto.usuario.nombre} ${arquitecto.usuario.apellido}`
    : user?.nombre || 'Arquitecto';
  const iniciales = arquitecto.usuario
    ? getInitials(arquitecto.usuario.nombre || '', arquitecto.usuario.apellido || '')
    : getInitials(user?.nombre || '', user?.apellido || '');
  const avatarColor = getAvatarColor(nombreCompleto, AVATAR_COLORS);
  const especialidades = arquitecto.especialidades
    ? arquitecto.especialidades.split(',').map(s => s.trim())
    : [];
  const rating = arquitecto.valoracion_prom_proyecto || 0;
  const ubicacion = arquitecto.ubicacion || 'Location not specified';

  return (
    <div className="architect-own-profile-page">
      {/* Header */}
      <header className="profile-header">
        <div className="aop-header-container">
          <div className="logo-section">
            <span className="logo-icon">🏛️</span>
            <span className="logo-text">ArquiPro</span>
          </div>
          <nav className="header-nav">
            <button onClick={() => navigate('/')} className="nav-link">Home</button>
            <button onClick={() => navigate('/architects')} className="nav-link">Find Architects</button>
            <button onClick={() => navigate('/about')} className="nav-link">About</button>
          </nav>
          <div className="header-auth">
            <span className="user-greeting">Hi, {user?.nombre}!</span>
            <button onClick={() => navigate('/arquitecto/chat')} className="messages-btn">
              <MessageCircle size={18} />
              Messages
            </button>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="profile-content-wrapper">
        {/* Left Panel - Architect Info */}
        <aside className="architect-info-panel">
          <div className="architect-avatar-large" style={{ backgroundColor: avatarColor }}>
            {arquitecto.usuario?.foto_perfil || user?.foto_perfil ? (
              <img src={arquitecto.usuario?.foto_perfil || user?.foto_perfil || ''} alt={nombreCompleto} />
            ) : (
              <span>{iniciales}</span>
            )}
          </div>
          <h1 className="architect-name-large">{nombreCompleto}</h1>
          <p className="architect-title">{ubicacion}</p>
          {arquitecto.descripcion && (
            <p className="architect-description">{arquitecto.descripcion}</p>
          )}
          <div className="architect-rating-section">
            <div className="rating-display">
              <span className="star-icon">⭐</span>
              <span className="rating-value">{rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="architect-specialties">
            {especialidades.map((especialidad, index) => (
              <span key={index} className="specialty-tag">{especialidad}</span>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="action-btn primary"
              onClick={() => navigate(`/arquitecto/${arquitecto.id}`)}
            >
              <User size={18} />
              View Public Profile
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => navigate('/arquitecto/chat')}
            >
              <MessageCircle size={18} />
              Go to Chat
            </button>
            <button 
              className="action-btn tertiary"
              onClick={() => {/* Settings functionality */}}
            >
              <Settings size={18} />
              Settings
            </button>
            <button 
              className="action-btn logout"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Right Panel - Dashboard Info */}
        <main className="dashboard-info-panel">
          <h2 className="dashboard-title">My Dashboard</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3 className="stat-value">{arquitecto.vistas_perfil || 0}</h3>
              <p className="stat-label">Profile Views</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-value">{rating.toFixed(1)}</h3>
              <p className="stat-label">Average Rating</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-value">{especialidades.length}</h3>
              <p className="stat-label">Specialties</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-value">{arquitecto.verificado ? '✓' : '—'}</h3>
              <p className="stat-label">Verification Status</p>
            </div>
          </div>

          <div className="info-section">
            <h3 className="info-title">Profile Information</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Cédula:</span>
                <span className="info-value">{arquitecto.cedula}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Location:</span>
                <span className="info-value">{ubicacion}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`info-value status ${arquitecto.verificado ? 'verified' : 'pending'}`}>
                  {arquitecto.verificado ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


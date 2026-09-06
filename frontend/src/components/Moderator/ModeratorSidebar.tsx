import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, AlertCircle, CheckCircle, LogOut, Menu, X, FileText } from 'lucide-react';
import '../../styles/Moderator/ModeratorSidebar.css';

export const ModeratorSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = [
    {
      path: '/moderador/dashboard',
      label: 'Dashboard',
      icon: Home
    },
    {
      path: '/moderador/incidencias',
      label: 'Incidencias',
      icon: AlertCircle
    },
    {
      path: '/moderador/verificaciones',
      label: 'Verificaciones',
      icon: CheckCircle
    },
    {
      path: '/moderador/reportes',
      label: 'Reportes',
      icon: FileText
    }
  ];

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Detectar tamaño de pantalla para mostrar/ocultar toggle
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 992);
      if (window.innerWidth > 992) {
        setIsOpen(false); // Cerrar sidebar en desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar sidebar al hacer clic fuera en móvil
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.moderator-sidebar') && !target.closest('.sidebar-toggle')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      {/* Botón toggle para móvil */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para móvil */}
      {isOpen && isMobile && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`moderator-sidebar ${isOpen ? 'moderator-sidebar--open' : ''}`}>
        <div className="moderator-sidebar__header">
          <h2 className="moderator-sidebar__logo">ArquiPro</h2>
          <div className="moderator-sidebar__user">
            <p className="moderator-sidebar__role">Moderator</p>
            <p className="moderator-sidebar__access">Admin Access</p>
          </div>
        </div>

        <nav className="moderator-sidebar__nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`moderator-sidebar__link ${isActive ? 'moderator-sidebar__link--active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="moderator-sidebar__logout"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </aside>
    </>
  );
};

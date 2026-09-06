import { useState } from 'react'
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { Home, Folder, MessageSquare, User, LogOut, Plus, Menu, X } from 'lucide-react'
import { NotificacionesDropdown } from '../../common/NotificacionesDropdown'
import AIChatFloat from '../../AIChatFloat'
import '../../../styles/ClienteLayout.css'
import '../../../styles/Moderator/ModeratorSidebar.css'

const ArquitectoLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const menuItems = [
    { path: '/arquitecto/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/arquitecto/mis-proyectos', icon: Folder, label: 'Mis Proyectos' },
    { path: '/arquitecto/chat', icon: MessageSquare, label: 'Conversaciones' },
    { path: '/arquitecto/create-project', icon: Plus, label: 'Crear Proyecto' },
    { path: '/arquitecto/profile', icon: User, label: 'Mi Perfil' }
  ]

  const isActive = (path: string) => location.pathname === path

  const handleLinkClick = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="cliente-layout">
      {/* Sidebar - reutiliza clases del moderator sidebar para estilo consistente */}
      <aside className={`cliente-sidebar moderator-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="moderator-sidebar__header">
          <div className="sidebar-header-content">
            <h2 className="moderator-sidebar__logo">ArquiPro</h2>
            <button 
              className="sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={24} />
            </button>
          </div>
          <div className="moderator-sidebar__user">
            <p className="moderator-sidebar__role">Arquitecto</p>
            <p className="moderator-sidebar__access">Acceso Profesional</p>
          </div>
        </div>

        <nav className="moderator-sidebar__nav">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`moderator-sidebar__link ${active ? 'moderator-sidebar__link--active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button onClick={handleLogout} className="moderator-sidebar__logout">
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="cliente-main">
        {/* Header */}
        <header className="cliente-header">
          <div className="cliente-header-content">
            <div className="cliente-header-left">
              <button 
                className="hamburger-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Abrir menú"
              >
                <Menu size={24} />
              </button>
            </div>

            <div className="cliente-header-right">
              <NotificacionesDropdown />

              <div className="cliente-user-menu">
                <div className="cliente-user-info">
                  <span className="cliente-user-name">{user?.nombre} {user?.apellido}</span>
                  <span className="cliente-user-email">{user?.email}</span>
                </div>
                {user?.foto_perfil ? (
                  <img 
                    src={user.foto_perfil} 
                    alt={`${user.nombre} ${user.apellido}`}
                    className="cliente-user-avatar"
                  />
                ) : (
                  <div className="cliente-user-avatar-placeholder">
                    {user?.nombre?.[0]}{user?.apellido?.[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="cliente-content">
          <Outlet />
        </main>
      </div>
      
      {/* Overlay para cerrar sidebar en móvil */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* AI Chat Float Button */}
      {user && (
        <AIChatFloat 
          userId={user.id}
          userRole="arquitecto"
          mode="float"
        />
      )}
    </div>
  )
}

export default ArquitectoLayout

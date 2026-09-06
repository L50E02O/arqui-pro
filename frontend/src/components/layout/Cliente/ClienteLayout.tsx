import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { Home, Folder, MessageSquare, Search, LogOut } from 'lucide-react'
import { NotificacionesDropdown } from '../../common/NotificacionesDropdown'
import AIChatFloat from '../../AIChatFloat'
import '../../../styles/ClienteLayout.css'
import '../../../styles/Moderator/ModeratorSidebar.css'

const ClienteLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const menuItems = [
    { path: '/cliente/home', icon: Home, label: 'Inicio' },
    { path: '/cliente/mis-proyectos', icon: Folder, label: 'Mis Proyectos' },
    { path: '/cliente/conversaciones', icon: MessageSquare, label: 'Conversaciones' },
    { path: '/cliente/find-arquitectos', icon: Search, label: 'Buscar Arquitecto' }
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="cliente-layout">
      {/* Sidebar - reutiliza clases del moderator sidebar para estilo consistente */}
      <aside className="cliente-sidebar moderator-sidebar">
        <div className="moderator-sidebar__header">
          <h2 className="moderator-sidebar__logo">ArquiPro</h2>
          <div className="moderator-sidebar__user">
            <p className="moderator-sidebar__role">Cliente</p>
            <p className="moderator-sidebar__access">Acceso de cliente</p>
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
              {/* El título se puede personalizar desde cada página */}
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

      {/* AI Chat Float Button */}
      {user && (
        <AIChatFloat 
          userId={user.id}
          userRole="cliente"
          mode="float"
        />
      )}
    </div>
  )
}

export default ClienteLayout

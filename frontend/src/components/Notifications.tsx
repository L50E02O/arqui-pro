import { useState } from 'react';
import { Bell, X, MessageCircle, Users } from 'lucide-react';
import { useNotifications, type Notificacion } from '../hooks/useNotifications';
import '../styles/Notifications.css';

interface NotificationsProps {
  usuarioId: string;
  onNotificationClick?: (notificacion: Notificacion) => void;
}

export function Notifications({ usuarioId, onNotificationClick }: NotificationsProps) {
  const { notificaciones, isConnected, markAsRead, clearAll, unreadCount } = useNotifications({
    usuarioId,
    autoConnect: true
  });

  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notificacion: Notificacion) => {
    markAsRead(notificacion.id);
    if (onNotificationClick) {
      onNotificationClick(notificacion);
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'mensaje':
        return <MessageCircle size={20} />;
      case 'conversacion':
        return <Users size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const formatTime = (fecha: string) => {
    const date = new Date(fecha);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    return `Hace ${days} días`;
  };

  return (
    <div className="notifications-container">
      {/* Bell Icon */}
      <button className="notifications-bell" onClick={togglePanel}>
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
        <span className={`notifications-status ${isConnected ? 'connected' : 'disconnected'}`} />
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <div>
              <h3>Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="unread-count">{unreadCount} sin leer</span>
              )}
            </div>
            <div className="notifications-actions">
              {notificaciones.length > 0 && (
                <button onClick={clearAll} className="clear-btn">
                  Limpiar
                </button>
              )}
              <button onClick={togglePanel} className="close-btn">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="notifications-list">
            {notificaciones.length === 0 ? (
              <div className="notifications-empty">
                <Bell size={48} />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notificaciones.map((notificacion) => (
                <div
                  key={notificacion.id}
                  className={`notification-item ${!notificacion.leida ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notificacion)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notificacion.tipo)}
                  </div>
                  <div className="notification-content">
                    <h4>{notificacion.titulo}</h4>
                    <p>{notificacion.mensaje}</p>
                    <span className="notification-time">
                      {formatTime(notificacion.fecha)}
                    </span>
                  </div>
                  {!notificacion.leida && <div className="notification-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

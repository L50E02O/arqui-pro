import { useState, useEffect } from 'react';
import { chatService } from '../services/websocket/chatService';
import type { Mensaje } from '../types/mensaje.types';
import '../styles/NotificationInbox.css';

interface Notificacion {
  id: string;
  mensaje: Mensaje;
  senderName: string;
  timestamp: Date;
  leida: boolean;
}

export function NotificationInbox() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string>('');

  useEffect(() => {
    // Obtener usuario actual
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        // Soportar diferentes estructuras: user.user.id o user.id
        const userId = parsedData.user?.id || parsedData.id;
        if (userId) {
          setUsuarioId(String(userId));
        }
      } catch (error) {
        console.error('Error parsing user_data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!usuarioId) return;

    // Conectar al servicio de chat
    chatService.connect(usuarioId);

    // Escuchar todos los mensajes nuevos (de todas las conversaciones)
    const unsubscribeGlobal = chatService.onGlobalMessage((mensaje: Mensaje) => {
      // Solo agregar si NO es del usuario actual
      if (mensaje.remitente_id !== usuarioId) {
        const senderName = mensaje.remitente?.nombre || 'Usuario';
        
        const nuevaNotificacion: Notificacion = {
          id: `notif-${mensaje.id}`,
          mensaje,
          senderName,
          timestamp: new Date(),
          leida: false,
        };

        setNotificaciones(prev => [nuevaNotificacion, ...prev]);
      }
    });

    return () => {
      unsubscribeGlobal();
    };
  }, [usuarioId]);

  const toggleInbox = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Marcar todas como leídas cuando se abre
      setNotificaciones(prev => 
        prev.map(n => ({ ...n, leida: true }))
      );
    }
  };

  const eliminarNotificacion = (id: string) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  };

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  const formatTime = (mensaje: Mensaje) => {
    if (mensaje.hora_envio) {
      const [horas, minutos] = mensaje.hora_envio.split(':');
      return `${horas}:${minutos}`;
    }
    const date = new Date(mensaje.fecha_envio);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="notification-inbox-container">
      {/* Botón de notificaciones */}
      <button className="notification-bell" onClick={toggleInbox}>
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {notificacionesNoLeidas > 0 && (
          <span className="notification-badge">{notificacionesNoLeidas}</span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <>
          <div className="notification-overlay" onClick={toggleInbox}></div>
          <div className="notification-panel">
            <div className="notification-header">
              <h3>Notificaciones</h3>
              <button 
                className="notification-close" 
                onClick={toggleInbox}
              >
                ×
              </button>
            </div>

            <div className="notification-list">
              {notificaciones.length === 0 ? (
                <div className="notification-empty">
                  <p>No tienes notificaciones</p>
                </div>
              ) : (
                notificaciones.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${notif.leida ? 'leida' : 'no-leida'}`}
                  >
                    <div className="notification-content">
                      <div className="notification-sender">
                        {notif.senderName}
                      </div>
                      <div className="notification-message">
                        {notif.mensaje.contenido}
                      </div>
                      <div className="notification-time">
                        {formatTime(notif.mensaje)}
                      </div>
                    </div>
                    <button 
                      className="notification-delete"
                      onClick={() => eliminarNotificacion(notif.id)}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

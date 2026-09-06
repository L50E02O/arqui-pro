import { useState, useEffect, useRef } from 'react'
import { Bell, X, CheckCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import axiosInstance from '../../services/api/axiosInstance'
import notificacionesService from '../../services/api/notificacionesService'
import { notificationService } from '../../services/websocket/notificationService'
import '../../styles/NotificacionesDropdown.css'

interface Notificacion {
  id: string
  usuario_id: string
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  created_at: string
}

export const NotificacionesDropdown = () => {
  const { user } = useAuth()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const noLeidas = notificaciones.filter(n => !n.leida).length

  // Conectar con WebSocket al montar el componente
  useEffect(() => {
    if (user) {
      // Conectar al WebSocket de notificaciones
      notificationService.connect()

      // Escuchar nuevas notificaciones
      const unsubscribe = notificationService.onNotification((notification) => {
        console.log('🔔 Nueva notificación recibida:', notification)
        
        // Recargar notificaciones cuando llegue una nueva
        cargarNotificaciones()
        
        // Mostrar notificación del navegador si está permitido
        if (Notification.permission === 'granted') {
          new Notification(notification.data?.titulo || 'Nueva notificación', {
            body: notification.data?.mensaje || 'Tienes una nueva notificación',
            icon: '/logo.png'
          })
        }
      })

      return () => {
        unsubscribe()
        notificationService.disconnect()
      }
    }
  }, [user])

  // Cargar notificaciones
  const cargarNotificaciones = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/notificaciones?usuario_id=${user.id}`)
      const data = Array.isArray(response.data) ? response.data : []
      
      // Filtrar solo las notificaciones del usuario actual
      const notificacionesFiltradas = data.filter((n: Notificacion) => 
        String(n.usuario_id) === String(user.id)
      )
      
      // Ordenar por más recientes primero
      notificacionesFiltradas.sort((a: Notificacion, b: Notificacion) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      setNotificaciones(notificacionesFiltradas)
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      cargarNotificaciones()
    }
  }, [isOpen, user])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const marcarComoLeida = async (notificacionId: string) => {
    try {
      await notificacionesService.marcarComoLeida(notificacionId)
      
      setNotificaciones(prev =>
        prev.map(n => n.id === notificacionId ? { ...n, leida: true } : n)
      )
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error)
    }
  }

  const marcarTodasComoLeidas = async () => {
    if (!user) return
    
    try {
      await notificacionesService.marcarTodasLeidas(user.id)
      
      // Actualizar estado local
      setNotificaciones(prev =>
        prev.map(n => ({ ...n, leida: true }))
      )
      
      console.log('✅ Todas las notificaciones marcadas como leídas')
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error)
    }
  }

  const formatearFecha = (fecha: string) => {
    const now = new Date()
    const notifDate = new Date(fecha)
    const diffMs = now.getTime() - notifDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Justo ahora'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    
    return notifDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'mensaje':
        return '💬'
      case 'proyecto':
        return '📁'
      case 'solicitud':
        return '📋'
      case 'verificacion':
        return '✅'
      case 'incidencia':
        return '⚠️'
      default:
        return '🔔'
    }
  }

  return (
    <div className="notificaciones-dropdown" ref={dropdownRef}>
      <button 
        className="notificaciones-btn" 
        aria-label="Notificaciones"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={18} />
        {noLeidas > 0 && (
          <span className="notificacion-badge">{noLeidas}</span>
        )}
      </button>

      {isOpen && (
        <div className="notificaciones-panel">
          <div className="notificaciones-header">
            <h3>Notificaciones</h3>
            <div className="notificaciones-actions">
              {noLeidas > 0 && (
                <button 
                  onClick={marcarTodasComoLeidas}
                  className="btn-marcar-todas"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="btn-cerrar"
                title="Cerrar"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="notificaciones-lista">
            {loading ? (
              <div className="notificaciones-loading">
                <div className="spinner-small"></div>
                <p>Cargando...</p>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="notificaciones-vacio">
                <Bell size={32} strokeWidth={1.5} />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notificacion-item ${!notif.leida ? 'no-leida' : ''}`}
                  onClick={() => !notif.leida && marcarComoLeida(notif.id)}
                >
                  <div className="notif-icon">{getTipoIcon(notif.tipo)}</div>
                  <div className="notif-contenido">
                    <h4 className="notif-titulo">{notif.titulo}</h4>
                    <p className="notif-mensaje">{notif.mensaje}</p>
                    <span className="notif-fecha">{formatearFecha(notif.created_at)}</span>
                  </div>
                  {!notif.leida && <div className="notif-dot"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, Star, User, Building2 } from 'lucide-react'
import proyectosService from '../../services/api/proyectosService'
import clienteService from '../../services/api/clienteService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import ImageGallery from '../../components/proyecto/ImageGallery'
import ProjectProgress from '../../components/proyecto/ProjectProgress'
import ValoracionForm from '../../components/proyecto/ValoracionForm'
import ValoracionesList from '../../components/proyecto/ValoracionesList'
import { useAuth } from '../../contexts/AuthContext'
import type { Proyecto } from '../../types'
import type { Cliente } from '../../types/cliente.types'
import '../../styles/ProyectoDetail.css'

function ProyectoDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'gallery' | 'progress' | 'valoraciones'>('gallery')
  const [refreshValoraciones, setRefreshValoraciones] = useState(0)

  useEffect(() => {
    const fetchProyecto = async () => {
      if (!id) return

      setLoading(true)
      setError(null)

      try {
        const proyectoData = await proyectosService.getById(id)
        setProyecto(proyectoData)
      } catch (err) {
        console.error('Error al cargar el proyecto:', err)
        setError('No se pudo cargar la información del proyecto')
      } finally {
        setLoading(false)
      }
    }

    fetchProyecto()
  }, [id])

  // Obtener datos del cliente logeado si es cliente
  useEffect(() => {
    const fetchCliente = async () => {
      if (user?.rol !== 'cliente' || !user?.id) {
        setCliente(null)
        return
      }

      try {
        console.log('Buscando cliente del usuario:', user.id)
        // Obtener todos los clientes y filtrar por usuario_id
        const clientes = await clienteService.getAll()
        const clienteLogeado = clientes.find((c) => c.usuario?.id === user.id)
        if (clienteLogeado) {
          setCliente(clienteLogeado)
          console.log('Cliente encontrado:', clienteLogeado)
        }
      } catch (err) {
        console.error('Error al obtener cliente logeado:', err)
      }
    }

    fetchCliente()
  }, [user])

  const handleValoracionCreada = () => {
    // Trigger refresh de la lista de valoraciones
    setRefreshValoraciones((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="proyecto-detail-container">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !proyecto) {
    return (
      <div className="proyecto-detail-container">
        <ErrorMessage message={error || 'Proyecto no encontrado'} />
      </div>
    )
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const arquitectoNombre = proyecto.arquitecto?.usuario
    ? `${proyecto.arquitecto.usuario.nombre} ${proyecto.arquitecto.usuario.apellido}`
    : 'Arquitecto'

  const clienteNombre = proyecto.cliente?.usuario
    ? `${proyecto.cliente.usuario.nombre} ${proyecto.cliente.usuario.apellido}`
    : 'Cliente'

  return (
    <div className="proyecto-detail-container">
      <div className="proyecto-detail-content">
        {/* Header Section */}
        <div className="proyecto-header">
          <div className="proyecto-header-main">
            <h1 className="proyecto-title">{proyecto.titulo_proyecto}</h1>
            <p className="proyecto-description">{proyecto.descripcion}</p>
          </div>

          {/* Project Info Grid */}
          <div className="proyecto-info-grid">
            <div className="info-card">
              <div className="info-icon-wrapper">
                <Building2 size={20} />
              </div>
              <div className="info-content">
                <span className="info-label">Tipo de Proyecto</span>
                <span className="info-value">{proyecto.tipo_proyecto}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon-wrapper">
                <Calendar size={20} />
              </div>
              <div className="info-content">
                <span className="info-label">Fecha de Publicación</span>
                <span className="info-value">{formatDate(proyecto.fecha_publicacion)}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon-wrapper">
                <User size={20} />
              </div>
              <div className="info-content">
                <span className="info-label">Arquitecto</span>
                <span className="info-value">{arquitectoNombre}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon-wrapper">
                <User size={20} />
              </div>
              <div className="info-content">
                <span className="info-label">Cliente</span>
                <span className="info-value">{clienteNombre}</span>
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="proyecto-rating-section">
            <span className="rating-label">Valoración Promedio</span>
            <div className="rating-display">
              <Star className="rating-star" size={28} fill="#ff6b35" />
              <span className="rating-value">
                {proyecto.valoracion_promedio.toFixed(1)}
              </span>
              <span className="rating-reviews">
                {/* ({proyecto.valoracion_promedio >= 4 ? '12' : '0'} Reviews) */}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="proyecto-tabs">
          <button
            className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            Galería de Imágenes
          </button>
          <button
            className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Progreso del Proyecto (Avances)
          </button>
          <button
            className={`tab-button ${activeTab === 'valoraciones' ? 'active' : ''}`}
            onClick={() => setActiveTab('valoraciones')}
          >
            Valoraciones
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'gallery' ? (
            <ImageGallery proyecto={proyecto} />
          ) : activeTab === 'progress' ? (
            <ProjectProgress avances={proyecto.avances || []} />
          ) : (
            <>
              <ValoracionForm proyecto={proyecto} cliente={cliente} onValoracionCreada={handleValoracionCreada} />
              <ValoracionesList proyectoId={proyecto.id} cliente={cliente} refreshTrigger={refreshValoraciones} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProyectoDetail

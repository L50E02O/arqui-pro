import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROUTES } from '../config/constants'
import valoracionesService from '../services/api/valoracionesService'
import proyectosService from '../services/api/proyectosService'
import type { Valoracion } from '../types/valoracion.types'
import type { Proyecto } from '../types/proyecto.types'
import '../styles/Home.css'

function Home() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([])
  const [proyectosContratados, setProyectosContratados] = useState<Proyecto[]>([])
  const [loadingValoraciones, setLoadingValoraciones] = useState(true)
  const [loadingProyectos, setLoadingProyectos] = useState(true)

  // Redirección automática si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('👤 Usuario autenticado detectado en Home, redirigiendo...', user.rol);
      
      if (user.rol === 'moderador') {
        navigate("/moderador/dashboard", { replace: true });
      } else if (user.rol === "cliente") {
        navigate("/cliente/home", { replace: true });
      } else if (user.rol === "arquitecto") {
        navigate("/arquitecto/profile", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Cargar valoraciones
  useEffect(() => {
    const cargarValoraciones = async () => {
      try {
        setLoadingValoraciones(true)
        const data = await valoracionesService.getAll()
        // Mostrar solo las últimas 6 valoraciones
        setValoraciones(data.slice(0, 6))
      } catch (error) {
        console.error('Error al cargar valoraciones:', error)
      } finally {
        setLoadingValoraciones(false)
      }
    }
    cargarValoraciones()
  }, [])

  // Cargar proyectos contratados
  useEffect(() => {
    const cargarProyectosContratados = async () => {
      try {
        setLoadingProyectos(true)
        // Usar método público para el home landing
        const data = await proyectosService.getAll(undefined, true)
        // Filtrar solo proyectos tipo 'contratado' y mostrar los últimos 6
        const contratados = data
          .filter((p: Proyecto) => p.tipo_proyecto === 'contratado')
          .slice(0, 6)
        setProyectosContratados(contratados)
      } catch (error) {
        console.error('Error al cargar proyectos contratados:', error)
      } finally {
        setLoadingProyectos(false)
      }
    }
    cargarProyectosContratados()
  }, [])

  const handleSearch = () => {
    navigate(ROUTES.ARCHITECTS)
  }

  const renderStars = (calificacion: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= calificacion ? 'star-filled' : 'star-empty'}>
          ★
        </span>
      )
    }
    return stars
  }

  return (
    <div className="home-container">
      <main className="main-content">
        {/* Hero Section with Background Image */}
        <section className="hero-banner">
          <div className="hero-overlay">
            <h1 className="hero-main-title">Da vida a tu visión arquitectónica</h1>
            <p className="hero-main-subtitle">
              ArquiPro conecta a clientes con arquitectos profesionales para crear espacios extraordinarios.
            </p>
            <div className="hero-buttons">
              <button 
                onClick={() => navigate(ROUTES.REGISTER_CLIENTE)} 
                className="home-btn-primary"
                aria-label="Comenzar - Registrarse como cliente"
              >
                Comenzar
              </button>
              <button 
                onClick={() => navigate(ROUTES.ARCHITECTS)} 
                className="home-btn-secondary"
                aria-label="Buscar arquitectos disponibles"
              >
                Buscar arquitectos
              </button>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="search-section">
          <h2 className="search-title">Encuentra al arquitecto perfecto para tu proyecto</h2>
          <p className="search-subtitle">Comienza tu búsqueda abajo para descubrir profesionales talentosos.</p>
          
          <div className="search-box" style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
            <Search className="search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar por ubicación, tipo de proyecto o especialidad"
              className="search-input-main"
              style={{paddingLeft: '2.5rem'}}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              aria-label="Buscar arquitectos por ubicación, tipo de proyecto o especialidad"
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2 className="features-title">Todo lo que necesitas para colaborar y crear</h2>
          <p className="features-subtitle">
Descubre un conjunto de herramientas diseñadas para hacer que tu viaje arquitectónico sea más fluido de principio a fin.
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Búsqueda avanzada</h3>
              <p>Filtra arquitectos por especialidad, ubicación y tipo de proyecto para encontrar la mejor opción.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📁</div>
              <h3>Portafolios</h3>
              <p>Explora portafolios impresionantes para ver la calidad y el estilo del trabajo de cada arquitecto.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Mensajería directa</h3>
              <p>Comunícate de forma directa y segura con los arquitectos desde la plataforma.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section">
          <h2 className="section-title-large">Cómo funciona</h2>
          <p className="section-subtitle-large">
            Un proceso sencillo y eficiente para llevar tu proyecto a la realidad.
          </p>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">🔍</div>
              <h3>1. Buscar y descubrir</h3>
              <p>Explora perfiles y reseñas para encontrar al arquitecto adecuado para tu visión y presupuesto.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">🤝</div>
              <h3>2. Conectar y colaborar</h3>
              <p>Usa nuestra mensajería segura para discutir tu proyecto, compartir archivos y alinear detalles.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">🏗️</div>
              <h3>3. Construye tu proyecto</h3>
              <p>Una vez que contrates a tu arquitecto, comienza el emocionante proceso de hacer realidad tus ideas.</p>
            </div>
          </div>
        </section>

        {/* Valoraciones Section */}
        <section className="valoraciones-section">
          <h2 className="section-title-large">Valoraciones Recientes</h2>
          <p className="section-subtitle-large">
            Descubre lo que nuestros clientes dicen sobre sus proyectos.
          </p>
          
          {loadingValoraciones ? (
            <div className="loading-message">Cargando valoraciones...</div>
          ) : valoraciones.length > 0 ? (
            <div className="valoraciones-grid">
              {valoraciones.map((valoracion) => (
                <div key={valoracion.id} className="valoracion-card">
                  <div className="valoracion-header">
                    <div className="valoracion-stars">
                      {renderStars(valoracion.calificacion)}
                    </div>
                    <div className="valoracion-rating">{valoracion.calificacion}/5</div>
                  </div>
                  <p className="valoracion-text">
                    "{valoracion.comentario}"
                  </p>
                  <div className="valoracion-footer">
                    <div className="valoracion-author">
                      {valoracion.cliente?.usuario 
                        ? `${valoracion.cliente.usuario.nombre} ${valoracion.cliente.usuario.apellido}`
                        : 'Cliente'
                      }
                    </div>
                    {valoracion.proyecto && (
                      <div className="valoracion-project">
                        Proyecto: {valoracion.proyecto.titulo_proyecto}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-message">No hay valoraciones disponibles</div>
          )}
        </section>

        {/* Proyectos Contratados Section */}
        <section className="proyectos-section">
          <h2 className="section-title-large">Proyectos Contratados</h2>
          <p className="section-subtitle-large">
            Explora algunos de los proyectos que se están desarrollando en nuestra plataforma.
          </p>
          
          {loadingProyectos ? (
            <div className="loading-message">Cargando proyectos...</div>
          ) : proyectosContratados.length > 0 ? (
            <div className="proyectos-grid">
              {proyectosContratados.map((proyecto) => (
                <div key={proyecto.id} className="proyecto-card">
                  {proyecto.imagenes && proyecto.imagenes.length > 0 ? (
                    <div 
                      className="proyecto-image"
                      style={{ backgroundImage: `url(${proyecto.imagenes[0].imagen_url})` }}
                    />
                  ) : (
                    <div className="proyecto-image proyecto-image-placeholder">
                      <span>🏗️</span>
                    </div>
                  )}
                  <div className="proyecto-content">
                    <h3 className="proyecto-title">{proyecto.titulo_proyecto}</h3>
                    <p className="proyecto-description">
                      {proyecto.descripcion.length > 150 
                        ? `${proyecto.descripcion.substring(0, 150)}...` 
                        : proyecto.descripcion
                      }
                    </p>
                    <div className="proyecto-footer">
                      {proyecto.arquitecto?.usuario && (
                        <div className="proyecto-architect">
                          Arquitecto: {proyecto.arquitecto.usuario.nombre} {proyecto.arquitecto.usuario.apellido}
                        </div>
                      )}
                      {proyecto.valoracion_promedio > 0 && (
                        <div className="proyecto-rating">
                          ⭐ {proyecto.valoracion_promedio.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-message">No hay proyectos contratados disponibles</div>
          )}
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <h2 className="cta-title">¿Listo para empezar tu próximo proyecto?</h2>
          <p className="cta-subtitle">
            Únete a ArquiPro hoy y da el primer paso para crear tu espacio ideal. 
            Encuentra un arquitecto o consigue tu próximo cliente.
          </p>
          <div className="cta-buttons">
            <button 
              onClick={() => navigate(ROUTES.ARCHITECTS)} 
              className="btn-cta-primary"
              aria-label="Buscar tu arquitecto ideal"
            >
              Encuentra tu arquitecto
            </button>
            <button 
              onClick={() => navigate(ROUTES.ARCHITECTS)} 
              className="btn-cta-secondary"
              aria-label="Registrarte como arquitecto"
            >
              Únete como arquitecto
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home

import '../styles/AboutUs.css'

function AboutUs() {
  return (
    <div className="about-container">

      <main className="about-content">
        <section className="about-hero">
          <h1 className="about-title">Acerca de ArquiPro</h1>
          <p className="about-subtitle">
            Conectando arquitectos visionarios con clientes ambiciosos
          </p>
        </section>

        <section className="about-sections">
          <div className="about-card">
            <div className="card-icon">🏛️</div>
            <h2>Nuestra misión</h2>
            <p>
              ArquiPro es una plataforma profesional diseñada para cerrar la brecha entre arquitectos
              talentosos y clientes que buscan soluciones de diseño excepcionales. Brindamos un espacio
              confiable donde la creatividad se encuentra con la oportunidad, permitiendo a los
              arquitectos mostrar sus portafolios y a los clientes descubrir al profesional perfecto para sus proyectos.
            </p>
          </div>

          <div className="about-card">
            <div className="card-icon">✨</div>
            <h2>Qué ofrecemos</h2>
            <ul className="features-list">
              <li><strong>Profesionales verificados:</strong> Todos los arquitectos pasan por un proceso de verificación para garantizar credibilidad y experiencia.</li>
              <li><strong>Portafolios:</strong> Los arquitectos pueden mostrar sus proyectos completos con descripciones e imágenes.</li>
              <li><strong>Comunicación en tiempo real:</strong> Sistema de mensajería integrado para una colaboración fluida entre cliente y arquitecto.</li>
              <li><strong>Gestión de proyectos:</strong> Seguimiento del progreso del proyecto con hitos y actualizaciones.</li>
              <li><strong>Sistema de valoraciones:</strong> Reseñas y calificaciones transparentes de clientes anteriores.</li>
            </ul>
          </div>

          <div className="about-card">
            <div className="card-icon">🎯</div>
            <h2>Cómo funciona</h2>
            <div className="steps">
              <div className="step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h3>Buscar y filtrar</h3>
                  <p>Explora arquitectos por especialidad, ubicación y valoraciones.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h3>Revisar portafolios</h3>
                  <p>Explora proyectos anteriores y lee testimonios de clientes.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <h3>Conectar y colaborar</h3>
                  <p>Envía solicitudes de proyecto y comunícate directamente con los arquitectos.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <div className="step-content">
                  <h3>Construir juntos</h3>
                  <p>Trabaja en conjunto para traer tu visión arquitectónica a la realidad.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="about-card">
            <div className="card-icon">🌟</div>
            <h2>Por qué elegir ArquiPro</h2>
            <div className="benefits-grid">
              <div className="benefit">
                <strong>🔒 Plataforma segura</strong>
                <p>Tus datos y comunicaciones están protegidos con medidas de seguridad estándar de la industria.</p>
              </div>
              <div className="benefit">
                <strong>📊 Precios transparentes</strong>
                <p>Sin cargos ocultos. Propuestas de proyecto y discusiones presupuestarias claras.</p>
              </div>
              <div className="benefit">
                <strong>⚡ Respuesta rápida</strong>
                <p>Notificaciones en tiempo real que te mantienen al tanto del desarrollo del proyecto.</p>
              </div>
              <div className="benefit">
                <strong>🏆 Garantía de calidad</strong>
                <p>Sólo profesionales verificados con trayectoria comprobada.</p>
              </div>
            </div>
          </div>

          <div className="about-card cta-card">
            <h2>¿Listo para comenzar tu proyecto?</h2>
            <p>Únete a miles de clientes satisfechos que encontraron a su arquitecto ideal en ArquiPro.</p>
            <div className="cta-buttons">
              <button className="au-btn-primary" onClick={() => window.location.href = '/architects'}>
                Buscar arquitectos
              </button>
              <button className="au-btn-secondary" onClick={() => window.location.href = '/register'}>
                Registrarse como arquitecto
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AboutUs

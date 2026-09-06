import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { 
  FileText, 
  Users, 
  FolderKanban, 
  AlertTriangle, 
  BarChart3,
  Loader2,
  Download,
  CheckCircle2,
  X,
  ExternalLink,
  Eye
} from 'lucide-react';
import { ModeratorLayout } from '../../components/Moderator/ModeratorLayout';
import { 
  REPORTE_KPIS_PLATAFORMA,
  REPORTE_ARQUITECTOS,
  REPORTE_PROYECTOS,
  REPORTE_INCIDENCIAS
} from '../../services/graphql/queries';
import { reportesService, type ReporteData } from '../../services/api/reportesService';
import '../../styles/Moderator/Reportes.css';

interface ReporteButton {
  id: string;
  nombre: string;
  descripcion: string;
  icono: React.ElementType;
  query: any;
  variables?: any;
  tipo: string;
}

export const Reportes = () => {
  const [reporteGenerando, setReporteGenerando] = useState<string | null>(null);
  const [reporteGenerado, setReporteGenerado] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reporteActual, setReporteActual] = useState<ReporteData | null>(null);
  const [htmlReporte, setHtmlReporte] = useState<string>('');

  // Lazy queries para cada tipo de reporte
  const [generarKPIs] = useLazyQuery(REPORTE_KPIS_PLATAFORMA, {
    fetchPolicy: 'network-only',
  });

  const [generarArquitectos] = useLazyQuery(REPORTE_ARQUITECTOS, {
    fetchPolicy: 'network-only',
  });

  const [generarProyectos] = useLazyQuery(REPORTE_PROYECTOS, {
    fetchPolicy: 'network-only',
  });

  const [generarIncidencias] = useLazyQuery(REPORTE_INCIDENCIAS, {
    fetchPolicy: 'network-only',
  });

  const botonesReportes: ReporteButton[] = [
    {
      id: 'kpis',
      nombre: 'Reporte de KPIs de la Plataforma',
      descripcion: 'Indicadores generales de la plataforma: usuarios, proyectos, estadísticas',
      icono: BarChart3,
      query: generarKPIs,
      tipo: 'kpis_plataforma',
    },
    {
      id: 'arquitectos',
      nombre: 'Reporte de Arquitectos',
      descripcion: 'Lista completa de arquitectos con sus datos y proyectos',
      icono: Users,
      query: generarArquitectos,
      variables: { limite: 100 },
      tipo: 'arquitectos',
    },
    {
      id: 'proyectos',
      nombre: 'Reporte de Proyectos',
      descripcion: 'Información detallada de todos los proyectos con avances e incidencias',
      icono: FolderKanban,
      query: generarProyectos,
      tipo: 'proyectos',
    },
    {
      id: 'incidencias',
      nombre: 'Reporte de Incidencias',
      descripcion: 'Lista completa de incidencias reportadas con información de usuarios involucrados',
      icono: AlertTriangle,
      query: generarIncidencias,
      variables: { limite: 100 },
      tipo: 'incidencias',
    },
  ];

  const handleGenerarReporte = async (boton: ReporteButton) => {
    try {
      setReporteGenerando(boton.id);
      setReporteGenerado(null);

      // Ejecutar la consulta GraphQL
      const { data, error } = await boton.query({
        variables: boton.variables || {},
      });

      if (error) {
        console.error('Error al generar reporte:', error);
        alert(`Error al generar el reporte: ${error.message}`);
        setReporteGenerando(null);
        return;
      }

      if (!data) {
        alert('No se obtuvieron datos para el reporte');
        setReporteGenerando(null);
        return;
      }

      // Guardar el reporte temporalmente
      const reporteId = reportesService.guardarReporte(
        boton.tipo,
        boton.nombre,
        data
      );

      // Obtener el reporte y generar HTML
      const reporte = reportesService.obtenerReporte(reporteId);
      if (!reporte) {
        alert('Error al procesar el reporte');
        setReporteGenerando(null);
        return;
      }

      // Generar HTML del reporte
      const html = reportesService.generarHTMLReporte(reporte);
      
      // Guardar en sessionStorage para la ruta (por si se abre en nueva pestaña)
      sessionStorage.setItem(`reporte-${reporteId}`, html);

      // Abrir modal con el reporte
      setReporteActual(reporte);
      setHtmlReporte(html);
      setModalAbierto(true);

      setReporteGenerado(boton.id);
      setReporteGenerando(null);

      // Limpiar el estado de éxito después de 3 segundos
      setTimeout(() => {
        setReporteGenerado(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error al generar reporte:', error);
      alert(`Error al generar el reporte: ${error.message || 'Error desconocido'}`);
      setReporteGenerando(null);
    }
  };

  const handleDescargarReporte = () => {
    if (reporteActual) {
      reportesService.descargarReporte(reporteActual);
    }
  };

  const handleAbrirEnNuevaVentana = () => {
    if (reporteActual) {
      const reporteUrl = reportesService.generarUrlReporte(reporteActual.id);
      window.open(reporteUrl, '_blank', 'width=1200,height=800');
    }
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setReporteActual(null);
    setHtmlReporte('');
  };

  return (
    <ModeratorLayout>
      <div className="reportes-container">
        <div className="reportes-header">
          <h1 className="reportes-title">
            <FileText size={32} />
            Generador de Reportes
          </h1>
        </div>

        <div className="reportes-grid">
          {botonesReportes.map((boton) => {
            const Icono = boton.icono;
            const estaGenerando = reporteGenerando === boton.id;
            const fueGenerado = reporteGenerado === boton.id;

            return (
              <div key={boton.id} className="reporte-card">
                <div className="reporte-card__header">
                  <div className="reporte-card__icon">
                    <Icono size={24} />
                  </div>
                  <h3 className="reporte-card__title">{boton.nombre}</h3>
                </div>
                <p className="reporte-card__description">{boton.descripcion}</p>
                <button
                  className={`reporte-card__button ${
                    estaGenerando ? 'reporte-card__button--loading' : ''
                  } ${fueGenerado ? 'reporte-card__button--success' : ''}`}
                  onClick={() => handleGenerarReporte(boton)}
                  disabled={estaGenerando}
                >
                  {estaGenerando ? (
                    <>
                      <Loader2 size={18} className="spinner" />
                      Generando...
                    </>
                  ) : fueGenerado ? (
                    <>
                      <CheckCircle2 size={18} />
                      Reporte Generado
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Generar Reporte
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Vista Previa del Reporte */}
      {modalAbierto && reporteActual && (
        <div className="reporte-modal-overlay" onClick={handleCerrarModal}>
          <div className="reporte-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reporte-modal__header">
              <div className="reporte-modal__title">
                <Eye size={24} />
                <h2>Vista Previa del Reporte</h2>
              </div>
              <button className="reporte-modal__close" onClick={handleCerrarModal}>
                <X size={24} />
              </button>
            </div>

            <div className="reporte-modal__info">
              <div className="reporte-info-item">
                <strong>Nombre:</strong> {reporteActual.nombre}
              </div>
              <div className="reporte-info-item">
                <strong>Tipo:</strong> {reporteActual.tipo}
              </div>
              <div className="reporte-info-item">
                <strong>Fecha:</strong> {new Date(reporteActual.fechaGeneracion).toLocaleString('es-ES')}
              </div>
            </div>

            <div className="reporte-modal__preview">
              <iframe
                srcDoc={htmlReporte}
                title="Vista previa del reporte"
                className="reporte-modal__iframe"
              />
            </div>

            <div className="reporte-modal__actions">
              <button 
                className="reporte-modal__button reporte-modal__button--secondary"
                onClick={handleAbrirEnNuevaVentana}
              >
                <ExternalLink size={18} />
                Abrir en Nueva Pestaña
              </button>
              <button 
                className="reporte-modal__button reporte-modal__button--primary"
                onClick={handleDescargarReporte}
              >
                <Download size={18} />
                Descargar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </ModeratorLayout>
  );
};


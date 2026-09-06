import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { reportesService } from '../../services/api/reportesService';
import { AlertCircle } from 'lucide-react';

export const ReporteViewer = () => {
  const { id } = useParams<{ id: string }>();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError('ID de reporte no proporcionado');
      setLoading(false);
      return;
    }

    try {
      // Intentar obtener el HTML del reporte desde sessionStorage
      const storedHtml = sessionStorage.getItem(`reporte-${id}`);
      
      if (storedHtml) {
        setHtmlContent(storedHtml);
        setLoading(false);
        return;
      }

      // Si no está en sessionStorage, intentar obtenerlo del servicio
      const reporte = reportesService.obtenerReporte(id);
      
      if (reporte) {
        const html = reportesService.generarHTMLReporte(reporte);
        setHtmlContent(html);
        // Intentar guardar en sessionStorage, pero continuar si falla
        try {
          sessionStorage.setItem(`reporte-${id}`, html);
        } catch (storageError) {
          console.warn('No se pudo guardar en sessionStorage:', storageError);
        }
        setLoading(false);
      } else {
        setError('❌ Reporte no encontrado o ha expirado.\n\nPosibles causas:\n• Los reportes expiran después de 24 horas\n• El reporte se generó en otra pestaña/ventana\n• Se limpió el caché del navegador\n\n💡 Solución: Vuelve a la página de reportes y genera el reporte nuevamente.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al cargar reporte:', error);
      setError('❌ Error al cargar el reporte.\n\nPor favor, intenta generarlo nuevamente desde la página de reportes.');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div>Cargando reporte...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'system-ui, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <AlertCircle size={48} color="#e74c3c" style={{ marginBottom: '16px' }} />
        <h1 style={{ color: '#2c3e50', marginBottom: '12px' }}>Error al cargar el reporte</h1>
        <p style={{ color: '#666', maxWidth: '500px' }}>{error}</p>
        <button
          onClick={() => window.close()}
          style={{
            marginTop: '24px',
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Cerrar ventana
        </button>
      </div>
    );
  }

  // Renderizar el HTML del reporte
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'auto' }}>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
};


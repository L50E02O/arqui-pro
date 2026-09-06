/**
 * Servicio para generar y gestionar reportes del moderador
 * Almacena reportes temporalmente en memoria y genera URLs para visualización
 */

export interface ReporteData {
  tipo: string;
  nombre: string;
  datos: any;
  fechaGeneracion: string;
  id: string;
}

class ReportesService {
  private reportes: Map<string, ReporteData> = new Map();
  private readonly REPORTE_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Genera un ID único para el reporte
   */
  private generarId(): string {
    return `reporte-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Guarda un reporte temporalmente en memoria
   */
  guardarReporte(tipo: string, nombre: string, datos: any): string {
    const id = this.generarId();
    const reporte: ReporteData = {
      tipo,
      nombre,
      datos,
      fechaGeneracion: new Date().toISOString(),
      id,
    };

    this.reportes.set(id, reporte);

    // Limpiar reportes expirados
    this.limpiarReportesExpirados();

    return id;
  }

  /**
   * Obtiene un reporte por su ID
   */
  obtenerReporte(id: string): ReporteData | null {
    const reporte = this.reportes.get(id);
    if (!reporte) {
      return null;
    }

    // Verificar si el reporte ha expirado
    const fechaGeneracion = new Date(reporte.fechaGeneracion).getTime();
    const ahora = Date.now();
    if (ahora - fechaGeneracion > this.REPORTE_EXPIRATION_TIME) {
      this.reportes.delete(id);
      return null;
    }

    return reporte;
  }

  /**
   * Genera una URL para acceder al reporte
   */
  generarUrlReporte(id: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/reports/${id}`;
  }

  /**
   * Limpia reportes expirados
   */
  private limpiarReportesExpirados(): void {
    const ahora = Date.now();
    const idsAEliminar: string[] = [];

    this.reportes.forEach((reporte, id) => {
      const fechaGeneracion = new Date(reporte.fechaGeneracion).getTime();
      if (ahora - fechaGeneracion > this.REPORTE_EXPIRATION_TIME) {
        idsAEliminar.push(id);
      }
    });

    idsAEliminar.forEach((id) => this.reportes.delete(id));
  }

  /**
   * Formatea los datos del reporte para visualización
   */
  formatearReporte(reporte: ReporteData): string {
    return JSON.stringify(reporte, null, 2);
  }

  /**
   * Descarga el reporte como archivo HTML
   */
  descargarReporte(reporte: ReporteData): void {
    const html = this.generarHTMLReporte(reporte);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reporte.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Genera un reporte en formato HTML para visualización
   */
  generarHTMLReporte(reporte: ReporteData): string {
    const fecha = new Date(reporte.fechaGeneracion).toLocaleString('es-ES');
    const nombreArchivo = reporte.nombre.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reporte.nombre} - ArquiPro</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 30px;
      position: relative;
    }
    .header {
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .download-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .download-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .download-btn:active {
      transform: translateY(0);
    }
    .header h1 {
      color: #2c3e50;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .header .meta {
      color: #666;
      font-size: 14px;
    }
    .content {
      margin-top: 20px;
    }
    pre {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 20px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.6;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
      border-left: 4px solid #3498db;
    }
    .stat-card h3 {
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 8px;
    }
    .stat-card .value {
      font-size: 24px;
      font-weight: bold;
      color: #2c3e50;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #2c3e50;
    }
    tr:hover {
      background: #f8f9fa;
    }
  </style>
</head>
<body>
    <div class="container">
      <div class="header">
        <div>
          <h1>${reporte.nombre}</h1>
          <div class="meta">
            <strong>Tipo:</strong> ${reporte.tipo} | 
            <strong>Fecha de Generación:</strong> ${fecha}
          </div>
        </div>

      </div>
    <div class="content">
      <pre id="reporte-data">${this.formatearReporte(reporte)}</pre>
    </div>
  </div>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const downloadBtn = document.getElementById('download-btn');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
          e.preventDefault();
          try {
            const fullHtml = document.documentElement.outerHTML;
            const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fecha = new Date().toISOString().split('T')[0];
            link.download = '${nombreArchivo}_' + fecha + '.html';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }, 100);
          } catch(error) {
            console.error('Error descargando reporte:', error);
            alert('Error al descargar el reporte: ' + error.message);
          }
        });
      }
    });
  </script>
  </script>
</body>
</html>
    `;
  }
}

export const reportesService = new ReportesService();


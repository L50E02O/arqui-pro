import type { Proyecto } from '../../../../types';

type Props = {
  proyectos: Proyecto[];
  onProyectoClick: (proyectoId: string) => void;
  getProyectoImage: (proyecto: Proyecto) => string;
};

export default function ArchitectProjectsGrid({
  proyectos,
  onProyectoClick,
  getProyectoImage,
}: Props) {
  return (
    <div className="profile-main">
      <div className="main-header">
        <h2 className="section-title">Portafolio</h2>
        <span className="proyectos-count">
          {proyectos.length} {proyectos.length === 1 ? 'Proyecto' : 'Proyectos'}
        </span>
      </div>

      {proyectos.length > 0 ? (
        <div className="proyectos-grid">
          {proyectos.map((proyecto) => (
            <div
              key={proyecto.id}
              className="proyecto-card"
              onClick={() => onProyectoClick(proyecto.id)}
            >
              <div className="proyecto-image">
                <img src={getProyectoImage(proyecto)} alt={proyecto.titulo_proyecto} />
                <div className="proyecto-overlay">
                  <h3 className="proyecto-titulo">{proyecto.titulo_proyecto}</h3>
                  {proyecto.tipo_proyecto && (
                    <span className="proyecto-tipo">{proyecto.tipo_proyecto}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-proyectos">
          <p>Este arquitecto aún no ha publicado proyectos en su portafolio.</p>
        </div>
      )}
    </div>
  );
}

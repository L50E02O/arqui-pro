import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, Star } from 'lucide-react';
import proyectosService from '../../services/api/proyectosService';
import avancesService from '../../services/api/avancesService';
import supabaseStorage from '../../services/supabaseStorage';
import type { Proyecto } from '../../types/proyecto.types';
import type { Avance } from '../../types/avance.types';
import CreateAvanceModal from './components/project-detail/CreateAvanceModal';
import AddPortfolioImagesModal from './components/project-detail/AddPortfolioImagesModal';
import FinishProjectModal from './components/project-detail/FinishProjectModal';
import AvancesTimeline from './components/project-detail/AvancesTimeline';
import '../../styles/ArchitectProjectDetail.css';

type Props = Record<string, never>;

export default function ArchitectProjectDetail({}: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [avances, setAvances] = useState<Avance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de crear avance
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingAvance, setCreatingAvance] = useState(false);
  const [newAvance, setNewAvance] = useState({
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);

  // Modal de finalizar proyecto
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishingProject, setFinishingProject] = useState(false);

  // Modal de agregar imágenes a portafolio
  const [showAddImagesModal, setShowAddImagesModal] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProyectoDetails();
  }, [id]);

  const fetchProyectoDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const proyectoData = await proyectosService.getById(id);
      setProyecto(proyectoData as Proyecto);

      const avancesData = await avancesService.getAvancesByProyecto(id);
      setAvances(
        avancesData.sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        )
      );
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number }; message?: string };
      const errorMessage =
        errorObj.response?.status === 404
          ? 'Proyecto no encontrado'
          : errorObj.message || 'Error al cargar el proyecto';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setSelectedImages((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagesPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `proyectos/${id}/avances/${timestamp}_${file.name}`;
    const imagenUrl = await supabaseStorage.uploadImagen(file, fileName);
    if (!imagenUrl) throw new Error('Error al subir imagen a Supabase');
    return imagenUrl;
  };

  const handleCreateAvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newAvance.descripcion.trim()) return;

    try {
      setCreatingAvance(true);

      const imagenesUrls: string[] = [];
      for (const file of selectedImages) {
        const url = await uploadImage(file);
        imagenesUrls.push(url);
      }

      await avancesService.createAvance({
        proyecto_id: id,
        descripcion: newAvance.descripcion.trim(),
        fecha: newAvance.fecha,
        imagenes: imagenesUrls.map((url) => ({ url })),
      });

      setNewAvance({
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
      });
      setSelectedImages([]);
      setImagesPreviews([]);
      setShowCreateModal(false);

      await fetchProyectoDetails();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      alert(errorObj.message || 'Error al crear el avance');
    } finally {
      setCreatingAvance(false);
    }
  };

  const handleDeleteAvance = async (avanceId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este avance?')) return;

    try {
      await avancesService.deleteAvance(avanceId);
      await fetchProyectoDetails();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      alert(errorObj.message || 'Error al eliminar el avance');
    }
  };

  const handleAddImagesToPortfolio = async () => {
    if (!id || selectedImages.length === 0) return;

    try {
      setUploadingImages(true);

      const imagenesUrls: string[] = [];
      for (const file of selectedImages) {
        const timestamp = Date.now();
        const fileName = `proyectos/${id}/galeria/${timestamp}_${file.name}`;
        const url = await supabaseStorage.uploadImagen(file, fileName);
        if (url) imagenesUrls.push(url);
      }

      await proyectosService.update(id, {
        imagenes: imagenesUrls,
      } as any);

      setSelectedImages([]);
      setImagesPreviews([]);
      setShowAddImagesModal(false);

      await fetchProyectoDetails();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      alert(errorObj.message || 'Error al agregar imágenes');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleFinishProject = async () => {
    if (!id || !proyecto) return;

    try {
      setFinishingProject(true);

      await proyectosService.update(id, {
        tipo_proyecto: 'portafolio',
      });

      setShowFinishModal(false);
      await fetchProyectoDetails();
      alert('¡Proyecto finalizado con éxito! Ahora forma parte de tu portafolio.');
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      alert(errorObj.message || 'Error al finalizar el proyecto');
    } finally {
      setFinishingProject(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEstadoColor = (tipo: string) => {
    return tipo === 'contratado' ? '#3b82f6' : '#10b981';
  };

  if (loading) {
    return (
      <div className="architect-project-detail loading">
        <div className="spinner"></div>
        <p>Cargando detalles del proyecto...</p>
      </div>
    );
  }

  if (error || !proyecto) {
    return (
      <div className="architect-project-detail error">
        <div className="error-card">
          <h2>Error</h2>
          <p>{error || 'No se pudo cargar el proyecto'}</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
        </div>
      </div>
    );
  }

  const canCreateAvance = proyecto.tipo_proyecto === 'contratado';

  return (
    <div className="architect-project-detail">
      <header className="detail-header">
        <div className="header-actions">
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
          {proyecto.tipo_proyecto === 'contratado' && (
            <button
              onClick={() => setShowFinishModal(true)}
              className="btn-finish-project"
            >
              <CheckCircle size={18} />
              <span>Finalizar Proyecto</span>
            </button>
          )}
        </div>
        <h1 className="project-title">{proyecto.titulo_proyecto}</h1>
      </header>

      <div className="project-info-section">
        <div className="info-card">
          <div className="info-row">
            <div className="info-item">
              <span className="info-label">Tipo</span>
              <span className="info-value">
                {proyecto.tipo_proyecto === 'portafolio' ? 'Portafolio' : 'Contratado'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Estado</span>
              <span
                className="status-badge"
                style={{ backgroundColor: getEstadoColor(proyecto.tipo_proyecto) }}
              >
                {proyecto.tipo_proyecto === 'contratado' ? 'En Progreso' : 'Portafolio'}
              </span>
            </div>
            {proyecto.valoracion_promedio && (
              <div className="info-item">
                <span className="info-label">Valoración</span>
                <span className="info-value flex items-center gap-1">
                  <Star size={16} fill="#eab308" color="#eab308" />
                  {proyecto.valoracion_promedio.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <div className="project-description">
            <h3>Descripción</h3>
            <p>{proyecto.descripcion}</p>
          </div>

          {proyecto.imagenes && proyecto.imagenes.length > 0 && (
            <div className="project-images-section">
              <h3>Galería del Proyecto</h3>
              <div className="project-images-grid">
                {proyecto.imagenes.map((imagen, index) => (
                  <div key={imagen.id || index} className="project-image-item">
                    <img src={imagen.imagen_url} alt={`Proyecto ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="progress-section">
        <div className="section-header">
          <h2>
            {proyecto.tipo_proyecto === 'portafolio'
              ? 'Galería del Proyecto'
              : 'Avances del Proyecto'}
          </h2>
          {canCreateAvance && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-create-avance"
            >
              <Plus size={18} />
              <span>Nuevo Avance</span>
            </button>
          )}
          {proyecto.tipo_proyecto === 'portafolio' && (
            <button
              onClick={() => setShowAddImagesModal(true)}
              className="btn-create-avance"
            >
              <Plus size={18} />
              <span>Agregar Imágenes</span>
            </button>
          )}
        </div>

        <AvancesTimeline
          avances={avances}
          formatDate={formatDate}
          onDeleteAvance={handleDeleteAvance}
          tipoProyecto={proyecto.tipo_proyecto}
          canCreateAvance={canCreateAvance}
          onOpenCreateModal={() => setShowCreateModal(true)}
        />
      </div>

      <CreateAvanceModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAvance}
        newAvance={newAvance}
        setNewAvance={setNewAvance}
        creatingAvance={creatingAvance}
        handleImageSelect={handleImageSelect}
        imagesPreviews={imagesPreviews}
        removeImage={removeImage}
      />

      <AddPortfolioImagesModal
        show={showAddImagesModal}
        onClose={() => setShowAddImagesModal(false)}
        onSubmit={handleAddImagesToPortfolio}
        uploadingImages={uploadingImages}
        handleImageSelect={handleImageSelect}
        imagesPreviews={imagesPreviews}
        removeImage={removeImage}
        selectedImagesCount={selectedImages.length}
      />

      <FinishProjectModal
        show={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onConfirm={handleFinishProject}
        finishingProject={finishingProject}
      />
    </div>
  );
}

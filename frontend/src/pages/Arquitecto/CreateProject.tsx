import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeft, FolderPlus } from 'lucide-react';
import proyectosService from '../../services/api/proyectosService';
import arquitectosService from '../../services/api/arquitectosService';
import axiosInstance from '../../services/api/axiosInstance';
import type { CreateProyectoDto } from '../../types';
import { NotificationInbox } from '../../components/NotificationInbox';
import '../../styles/CreateProject.css';

export default function CreateProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clienteId = searchParams.get('cliente_id');

  const [arquitectoId, setArquitectoId] = useState<string | null>(null);
  const [clienteNombre, setClienteNombre] = useState<string>('');
  const [formData, setFormData] = useState({
    titulo_proyecto: '',
    descripcion: '',
    tipo_proyecto: 'contratado' as 'portafolio' | 'contratado',
    cliente_id: clienteId || '',
  });

  const [loading, setLoading] = useState(false);
  const [loadingArquitecto, setLoadingArquitecto] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Si no es arquitecto, redirigir
  useEffect(() => {
    if (!user || user.rol !== 'arquitecto') {
      navigate('/');
      return;
    }

    // Obtener el arquitecto_id del usuario actual
    const fetchArquitecto = async () => {
      try {
        setLoadingArquitecto(true);
        console.log('🔍 Buscando arquitecto para usuario:', user.id);
        const response = await arquitectosService.getAll();
        console.log('📦 Arquitectos obtenidos:', response.length);
        
        const arquitectoActual = response.find(
          (arq) => arq.usuario?.id === user.id || arq.usuario_id === user.id
        );
        
        if (arquitectoActual) {
          console.log('✅ Arquitecto encontrado:', arquitectoActual.id);
          setArquitectoId(String(arquitectoActual.id));
        } else {
          console.error('❌ No se encontró arquitecto para el usuario');
          setError('No se encontró tu perfil de arquitecto. Por favor, contacta al administrador.');
        }
      } catch (err) {
        console.error('Error al obtener arquitecto:', err);
        setError('Error al cargar tu perfil de arquitecto');
      } finally {
        setLoadingArquitecto(false);
      }
    };

    fetchArquitecto();
  }, [user, navigate]);

  // Obtener el nombre del cliente si existe cliente_id
  useEffect(() => {
    const fetchCliente = async () => {
      if (!clienteId) return;

      try {
        console.log('🔍 Buscando cliente:', clienteId);
        const response = await axiosInstance.get(`/clientes/${clienteId}`);
        const cliente = response.data;
        
        if (cliente && cliente.usuario) {
          const nombreCompleto = `${cliente.usuario.nombre} ${cliente.usuario.apellido}`;
          setClienteNombre(nombreCompleto);
          console.log('✅ Cliente encontrado:', nombreCompleto);
        }
      } catch (err) {
        console.error('❌ Error obteniendo cliente:', err);
        // Si falla, al menos mostrar el ID
        setClienteNombre(`Cliente ID: ${clienteId}`);
      }
    };

    fetchCliente();
  }, [clienteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!arquitectoId) {
        throw new Error('No se encontró el ID del arquitecto');
      }

      console.log('📤 Enviando proyecto:', {
        titulo_proyecto: formData.titulo_proyecto,
        descripcion: formData.descripcion,
        tipo_proyecto: formData.tipo_proyecto,
        arquitecto_id: arquitectoId,
      });

      const proyecto: CreateProyectoDto = {
        titulo_proyecto: formData.titulo_proyecto,
        descripcion: formData.descripcion,
        tipo_proyecto: formData.tipo_proyecto,
        arquitecto_id: arquitectoId,
        cliente_id: formData.cliente_id || null,
      };

      const result = await proyectosService.create(proyecto);
      console.log('✅ Proyecto creado exitosamente:', result);
      
      // Redirigir al dashboard del arquitecto
      navigate('/arquitecto/profile');
    } catch (err: any) {
      console.error('❌ Error completo:', err);
      console.error('Response data:', err.response?.data);
      console.error('Status code:', err.response?.status);
      
      // Si es error 401, no hacer nada (el interceptor ya maneja el logout)
      if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      const errorMessage = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.message || err.message || 'Error al crear el proyecto';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="create-project-page">
      {loadingArquitecto ? (
        <div className="loading-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          color: 'white',
          fontSize: '1.2rem'
        }}>
          Cargando perfil de arquitecto...
        </div>
      ) : (
      <div className="create-project-container">
        <div className="create-project-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1 className="page-title">
            <FolderPlus size={32} />
            Crear Nuevo Proyecto
          </h1>
        </div>

        {error && (
          <div className="cp-error-message">
            {error}
          </div>
        )}

        {!arquitectoId && !loadingArquitecto && (
          <div className="cp-error-message">
            No se pudo cargar tu perfil de arquitecto. Verifica la consola para más detalles.
          </div>
        )}

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-group">
            <label htmlFor="titulo_proyecto">Título del Proyecto *</label>
            <input
              type="text"
              id="titulo_proyecto"
              name="titulo_proyecto"
              value={formData.titulo_proyecto}
              onChange={handleChange}
              required
              placeholder="Ej: Casa Moderna en las Colinas"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              placeholder="Describe el proyecto..."
              rows={6}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipo_proyecto">Tipo de Proyecto *</label>
            <select
              id="tipo_proyecto"
              name="tipo_proyecto"
              value={formData.tipo_proyecto}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="contratado">Contratado</option>
              <option value="portafolio">Portafolio</option>
            </select>
          </div>

          {clienteId && (
            <div className="form-group">
              <label>Cliente</label>
              <input
                type="text"
                value={clienteNombre || 'Cargando...'}
                disabled
                className="form-input disabled"
              />
              <input
                type="hidden"
                value={formData.cliente_id}
              />
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !arquitectoId}
            >
              {loading ? 'Creando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
      )}
      <NotificationInbox />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import arquitectosService from '../../services/api/arquitectosService';
import conversacionesService from '../../services/api/conversacionesService';
import incidenciasService from '../../services/api/incidenciasService';
import imagenesService from '../../services/api/imagenesService';
import supabaseStorage from '../../services/supabaseStorage';
import axiosInstance from '../../services/api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import { useValoraciones } from '../../hooks/useValoraciones';
import ReportIncidenceModal from '../../components/common/ReportIncidenceModal';
import { useQuery } from '@apollo/client';
import { PERFIL_COMPLETO_ARQUITECTO } from '../../services/graphql/queries';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { CacheService } from '../../utils/cacheService';
import type { Arquitecto, Proyecto } from '../../types';
import ArchitectSidebar from './components/profile/ArchitectSidebar';
import ArchitectProjectsGrid from './components/profile/ArchitectProjectsGrid';
import '../../styles/ArquitectoProfile.css';

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#6C5CE7', '#FDA7DF', '#F8B500',
  '#95E1D3', '#F38181'
];

type Props = Record<string, never>;

export default function ArquitectoProfile({}: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const [arquitecto, setArquitecto] = useState<Arquitecto | null>(null);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [arquitectoIdReal, setArquitectoIdReal] = useState<string | null>(null);

  const valoracionesHook = useValoraciones({
    autoConnect: true,
  });

  const { promedio, isConnected: valoracionesConnected, initializePromedio, joinArquitecto } = valoracionesHook;

  const { data: gqlData, loading: gqlLoading, error: gqlError } = useQuery(PERFIL_COMPLETO_ARQUITECTO, {
    variables: { arquitectoId: id },
    skip: !id,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    const populateFromGql = async () => {
      if (!gqlData || !gqlData.perfilCompletoArquitecto) return;

      const perfil = gqlData.perfilCompletoArquitecto;
      let usuarioObj: any = null;
      if (perfil.datosBasicos) {
        usuarioObj = {
          nombre: perfil.datosBasicos.nombre,
          apellido: perfil.datosBasicos.apellido,
          email: perfil.datosBasicos.email,
          foto_perfil: perfil.datosBasicos.fotoPerfil || null,
        };
      } else if (perfil.usuario) {
        usuarioObj = {
          nombre: perfil.usuario.nombre,
          apellido: perfil.usuario.apellido,
          email: perfil.usuario.email,
          foto_perfil: perfil.usuario.foto_perfil || perfil.usuario.fotoPerfil || null,
        };
      }

      let arqData: Arquitecto;
      if (perfil.datosBasicos) {
        arqData = {
          id: perfil.datosBasicos.id,
          cedula: perfil.datosBasicos.cedula,
          descripcion: perfil.datosBasicos.descripcion || '',
          especialidades: perfil.datosBasicos.especialidades || '',
          ubicacion: perfil.datosBasicos.ubicacion || '',
          vistas_perfil: perfil.estadisticas?.totalVistas || 0,
          valoracion_prom_proyecto: perfil.estadisticas?.valoracionPromedio || 0.0,
          verificado: perfil.datosBasicos.verificado || false,
          usuario_id: perfil.datosBasicos.usuarioId || '',
          usuario: usuarioObj,
        } as Arquitecto;
      } else {
        const arqBase = perfil.arquitecto || {};
        arqData = {
          id: arqBase.id || id,
          cedula: arqBase.cedula || '',
          descripcion: arqBase.descripcion || '',
          especialidades: arqBase.especialidades || '',
          ubicacion: arqBase.ubicacion || '',
          vistas_perfil: arqBase.vistas_perfil || perfil.total_vistas || 0,
          valoracion_prom_proyecto: perfil.valoracion_promedio ?? arqBase.valoracion_prom_proyecto ?? 0.0,
          verificado: arqBase.verificado || false,
          usuario_id: arqBase.usuario_id || '',
          usuario: usuarioObj,
        } as Arquitecto;
      }

      setArquitecto(arqData);
      setArquitectoIdReal(arqData.id);

      if (arqData.valoracion_prom_proyecto !== undefined) {
        initializePromedio(arqData.valoracion_prom_proyecto, 0);
      }
      if (arqData.id) {
        joinArquitecto(arqData.id);
      }

      if (perfil.proyectos && Array.isArray(perfil.proyectos)) {
        const mapped = perfil.proyectos.map((p: any) => ({
          id: p.id,
          titulo_proyecto: p.titulo || p.titulo_proyecto,
          descripcion: p.descripcion,
          tipo_proyecto: p.tipoProyecto || p.tipo_proyecto,
          fecha_publicacion: p.fechaPublicacion || p.fecha_publicacion,
          valoracion_promedio: p.valoracionPromedio || p.valoracion_promedio,
          imagenes: (p.imagenes || []).map((img: any) => ({
            id: img.id,
            imagen_url: img.url || img.imagen_url,
          })),
        }));
        setProyectos(mapped as Proyecto[]);
      }

      setLoading(false);

      try {
        if (id) {
          await arquitectosService.incrementVistas(id);
          setArquitecto((prev) => (prev ? { ...prev, vistas_perfil: prev.vistas_perfil + 1 } : null));
        }
      } catch (err) {
        console.warn('[WARN] No se pudo incrementar vistas:', err);
      }
    };

    populateFromGql();
  }, [gqlData, id, initializePromedio, joinArquitecto]);

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const getProyectoImage = (proyecto: Proyecto): string => {
    if (proyecto.imagenes && proyecto.imagenes.length > 0) {
      return proyecto.imagenes[0].imagen_url;
    }
    return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=60';
  };

  const handleContactar = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (user.rol !== 'cliente') {
      alert('Solo los clientes pueden contactar a los arquitectos');
      return;
    }

    try {
      setCreatingConversation(true);
      const clienteResponse = await axiosInstance.get(`/clientes/usuario/${user.id}`);
      const clienteId = clienteResponse.data.id;

      if (!arquitectoIdReal) {
        throw new Error('No se pudo obtener el ID del arquitecto');
      }

      let conversacionId: string;
      const response = await conversacionesService.create({
        cliente_id: clienteId,
        arquitecto_id: arquitectoIdReal,
      });

      conversacionId = response.conversacion?.id || (response as any).id;
      CacheService.remove(`conversaciones_${user.id}_cache`);

      navigate('/cliente/conversaciones', {
        state: {
          conversacionId,
          autoOpen: true,
        },
      });
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      alert(errorObj.message || 'Error al contactar al arquitecto');
    } finally {
      setCreatingConversation(false);
    }
  };

  const handleProyectoClick = (proyectoId: string) => {
    if (location.pathname === `/architect/${id}`) {
      navigate(`/proyecto/${proyectoId}`);
    } else {
      navigate(`/cliente/proyecto/${proyectoId}`);
    }
  };

  const handleReportSubmit = async ({ descripcion, imagenes }: { descripcion: string; imagenes: File[] }) => {
    if (!user) {
      alert('Debes iniciar sesión para reportar');
      return;
    }

    let usuarioInfractorId: string | null = null;
    if (arquitecto?.usuario?.id) {
      usuarioInfractorId = arquitecto.usuario.id;
    } else if (arquitectoIdReal) {
      try {
        const resp = await axiosInstance.get(`/arquitectos/${arquitectoIdReal}`);
        usuarioInfractorId = resp.data.usuario_id || resp.data.usuario?.id || null;
      } catch (e) {
        console.warn('[WARN] No se pudo obtener usuario del arquitecto:', e);
      }
    }

    if (!usuarioInfractorId) {
      alert('No se pudo determinar el usuario del arquitecto. Intenta recargar la página.');
      return;
    }

    try {
      const incidenciaResponse = await incidenciasService.create({
        descripcion,
        usuario_emisor_id: user.id,
        usuario_infractor_id: usuarioInfractorId,
        estado: 'pendiente',
        moderador_id: null,
      });

      const incidenciaId = incidenciaResponse.id;

      if (imagenes && imagenes.length > 0) {
        for (let i = 0; i < imagenes.length; i++) {
          const file = imagenes[i];
          try {
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 9);
            const fileName = `incidencia-${incidenciaId}/${timestamp}-${randomStr}-${file.name}`;
            const imagenUrl = await supabaseStorage.uploadImagen(file, fileName);

            await imagenesService.create({
              imagen_url: imagenUrl,
              fecha: new Date().toISOString(),
              imagen_asociaciones_attributes: [
                {
                  asociable_type: 'Incidencia',
                  asociable_id: incidenciaId,
                },
              ],
            });
          } catch (imgError: unknown) {
            console.error('[ERROR] Error al procesar imagen:', imgError);
          }
        }
      }

      alert('Reporte enviado correctamente');
      setReportModalVisible(false);
    } catch (err: unknown) {
      console.error('[ERROR] Error al enviar incidencia:', err);
      alert('No se pudo enviar el reporte. Intenta nuevamente más tarde.');
      throw err;
    }
  };

  if (loading || gqlLoading) {
    return (
      <div className="arquitecto-profile-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || gqlError || !arquitecto) {
    return (
      <div className="arquitecto-profile-container">
        <ErrorMessage message={error || 'Arquitecto no encontrado'} />
      </div>
    );
  }

  const nombreCompleto = arquitecto.usuario
    ? `${arquitecto.usuario.nombre} ${arquitecto.usuario.apellido}`
    : 'Arquitecto';

  const iniciales = arquitecto.usuario
    ? `${arquitecto.usuario.nombre[0]}${arquitecto.usuario.apellido[0]}`
    : 'AR';

  const especialidadesList = arquitecto.especialidades
    ? arquitecto.especialidades.split(',').map((esp) => esp.trim())
    : [];

  const avatarColor = getAvatarColor(nombreCompleto);
  const promedioValoracion = valoracionesConnected && promedio !== null
    ? promedio
    : arquitecto.valoracion_prom_proyecto || 0.0;

  return (
    <div className="arquitecto-profile-container">
      <div className="arquitecto-profile-content">
        <ArchitectSidebar
          arquitecto={arquitecto}
          nombreCompleto={nombreCompleto}
          iniciales={iniciales}
          avatarColor={avatarColor}
          especialidadesList={especialidadesList}
          totalProyectos={proyectos.length}
          promedioValoracion={promedioValoracion}
          valoracionesConnected={valoracionesConnected}
          creatingConversation={creatingConversation}
          canReport={Boolean(user && user.rol === 'cliente')}
          onContactar={handleContactar}
          onReportar={() => setReportModalVisible(true)}
        />

        <ArchitectProjectsGrid
          proyectos={proyectos}
          onProyectoClick={handleProyectoClick}
          getProyectoImage={getProyectoImage}
        />
      </div>

      <ReportIncidenceModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}

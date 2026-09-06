import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Chat } from '../../components/Chat';
import { Search, Settings, MessageCircle } from 'lucide-react';
import { useConversaciones } from '../../hooks/useApiWithCache';
import axiosInstance from '../../services/api/axiosInstance';
import type { Conversacion } from '../../types';
import '../../styles/ClientChat.css';

interface Conversation {
  id: string;
  nombre: string;
  ultimoMensaje: string;
  timestamp: string;
  online?: boolean;
  unread?: number;
}

export default function ArchitectChat() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [arquitectoId, setArquitectoId] = useState<string | null>(null);
  
  // Obtener el arquitecto.id basado en el usuario.id
  useEffect(() => {
    const fetchArquitectoId = async () => {
      try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          console.log('Usuario logueado:', parsed);
          
          // Hacer petición al backend para obtener el arquitecto por usuario_id
          const response = await axiosInstance.get(`/arquitectos?usuario_id=${parsed.id}`);
          console.log('Respuesta arquitectos:', response.data);
          
          if (response.data && response.data.length > 0) {
            const arquitecto = response.data[0];
            console.log('Arquitecto encontrado:', arquitecto);
            setArquitectoId(arquitecto.id);
          } else if (response.data && response.data.id) {
            // Si la respuesta es un objeto directo
            console.log('Arquitecto encontrado (objeto):', response.data);
            setArquitectoId(response.data.id);
          }
        }
      } catch (error) {
        console.error('Error obteniendo arquitecto:', error);
      }
    };
    
    if (user?.id) {
      fetchArquitectoId();
    }
  }, [user?.id]);
  
  console.log('ID del Arquitecto para filtrar conversaciones:', arquitectoId);
  
  // Obtener conversaciones reales desde la API (ya filtradas por el backend)
  const { data: conversacionesData, loading: loadingConversaciones, error: errorConversaciones, refetch: refetchConversaciones } = useConversaciones(user?.id);
  
  console.log('📊 Conversaciones recibidas del backend:', conversacionesData);
  console.log('📊 Total conversaciones:', conversacionesData?.length);
  console.log('📊 Usuario actual:', user);
  console.log('📊 Arquitecto ID:', arquitectoId);
  
  // Transformar conversaciones de la API al formato de la UI
  const conversations = useMemo<Conversation[]>(() => {
    if (!conversacionesData || !Array.isArray(conversacionesData)) {
      console.log('❌ No hay datos de conversaciones o no es array', conversacionesData);
      return [];
    }

    console.log('✅ Total conversaciones recibidas del backend:', conversacionesData.length);
    
    // ⚠️ NO FILTRAR AQUÍ - El backend ya filtró por arquitecto_id
    // El backend solo devuelve las conversaciones del usuario autenticado

    return conversacionesData.map((conv: Conversacion) => {
      console.log('🔵 Procesando conversación:', {
        id: conv.id,
        arquitecto_id: conv.arquitecto_id,
        cliente_id: conv.cliente_id,
        cliente: conv.cliente
      });
      
      // Para arquitectos, el otro participante es el cliente
      const otroParticipante = conv.cliente;
      const nombre = otroParticipante?.usuario 
        ? `${otroParticipante.usuario.nombre} ${otroParticipante.usuario.apellido}`
        : 'Cliente';
      
      // Formatear fecha
      const fecha = new Date(conv.fecha);
      const ahora = new Date();
      const diffMs = ahora.getTime() - fecha.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      let timestamp = '';
      if (diffDays === 0) {
        timestamp = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        timestamp = 'Yesterday';
      } else if (diffDays < 7) {
        timestamp = `${diffDays} days ago`;
      } else {
        timestamp = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      }

      return {
        id: conv.id,
        nombre,
        ultimoMensaje: 'Click to view conversation', // Se puede mejorar obteniendo el último mensaje
        timestamp,
        online: false, // Se puede implementar con WebSocket
        unread: 0 // Se puede calcular contando mensajes no leídos
      };
    });
  }, [conversacionesData]); // Removido arquitectoId de las dependencias

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSelectConversation = (conversacionId: string) => {
    setChatOpen(false);
    setTimeout(() => {
      setSelectedConversation(conversacionId);
      setChatOpen(true);
    }, 100);
  };

  const handleCreateProject = () => {
    // Navegar a la página de crear proyecto con el cliente seleccionado
    const selectedConv = conversations.find(c => c.id === selectedConversation);
    if (selectedConv) {
      // Extraer el cliente_id de la conversación seleccionada
      const conversacion = conversacionesData?.find((c: Conversacion) => c.id === selectedConversation);
      if (conversacion?.cliente_id) {
        navigate(`/arquitecto/create-project?cliente_id=${conversacion.cliente_id}`);
      }
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const filteredConversations = conversations.filter(conv =>
    conv.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loadingConversaciones) {
    return (
      <div className="client-chat-page">
        <div className="chat-container-wrapper">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (errorConversaciones) {
    return (
      <div className="client-chat-page">
        <div className="chat-container-wrapper">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Error loading conversations: {errorConversaciones.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="client-chat-page">
      <div className="chat-container-wrapper">
        {/* Left Panel - Conversations List */}
        <aside className="conversations-panel">
          <div className="conversations-header">
            <h2>Conversaciones</h2>
            <button className="settings-icon-btn">
              <Settings size={20} />
            </button>
          </div>
          
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="conversations-list">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${selectedConversation === conversation.id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <div className="conversation-avatar">
                    <MessageCircle size={24} />
                    {conversation.online && <span className="online-indicator"></span>}
                  </div>
                  <div className="conversation-content">
                    <div className="conversation-header-row">
                      <h3 className="conversation-name">{conversation.nombre}</h3>
                      <span className="conversation-time">{conversation.timestamp}</span>
                    </div>
                    <p className="conversation-preview">{conversation.ultimoMensaje}</p>
                    {conversation.unread && conversation.unread > 0 && (
                      <span className="unread-badge">{conversation.unread}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-conversations">
                <p>No tienes conversaciones activas</p>
              </div>
            )}
          </div>
        </aside>

        {/* Right Panel - Chat Window */}
        <main className="chat-panel">
          {chatOpen && selectedConversation ? (
            <Chat
              conversacionId={selectedConversation}
              usuarioId={user.id}
              userRole="arquitecto"
              clienteInfo={(() => {
                const conv = conversacionesData?.find((c: Conversacion) => c.id === selectedConversation);
                const cliente = conv?.cliente;
                return cliente?.usuario 
                  ? {
                      id: cliente.id,
                      nombre: `${cliente.usuario.nombre} ${cliente.usuario.apellido}`
                    }
                  : { id: '', nombre: 'Cliente' };
              })()}
              onCreateProject={handleCreateProject}
              onClose={() => {
                setChatOpen(false);
                setSelectedConversation(null);
              }}
              onDeleteConversation={async () => {
                // Cerrar chat y refrescar lista de conversaciones
                setChatOpen(false);
                setSelectedConversation(null);
                await refetchConversaciones(); // Refrescar datos en lugar de reload
              }}
            />
          ) : (
            <div className="no-chat-selected">
              <div className="empty-state-icon">
                <MessageCircle size={48} strokeWidth={1.5} />
              </div>
              <h2>Selecciona una conversación</h2>
              <p>Elige una conversación de la lista para comenzar a chatear con tus clientes</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


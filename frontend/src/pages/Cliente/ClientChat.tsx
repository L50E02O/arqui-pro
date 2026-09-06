import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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

export default function ClientChat() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clienteId, setClienteId] = useState<string | null>(null);
  
  // Obtener el cliente.id basado en el usuario.id
  useEffect(() => {
    const fetchClienteId = async () => {
      try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          console.log('Usuario logueado:', parsed);
          
          // Hacer petición al backend para obtener el cliente por usuario_id
          const response = await axiosInstance.get(`/clientes?usuario_id=${parsed.id}`);
          console.log('Respuesta clientes:', response.data);
          
          if (response.data && response.data.length > 0) {
            const cliente = response.data[0];
            console.log('Cliente encontrado:', cliente);
            setClienteId(cliente.id);
          } else if (response.data && response.data.id) {
            // Si la respuesta es un objeto directo
            console.log('Cliente encontrado (objeto):', response.data);
            setClienteId(response.data.id);
          }
        }
      } catch (error) {
        console.error('Error obteniendo cliente:', error);
      }
    };
    
    if (user?.id) {
      fetchClienteId();
    }
  }, [user?.id]);
  
  console.log('ID del Cliente para filtrar conversaciones:', clienteId);
  
  // Obtener conversaciones reales desde la API
  const { data: conversacionesData, loading: loadingConversaciones, error: errorConversaciones, refetch: refetchConversaciones } = useConversaciones(user?.id);
  
  // Transformar conversaciones de la API al formato de la UI
  const conversations = useMemo<Conversation[]>(() => {
    if (!conversacionesData || !Array.isArray(conversacionesData)) {
      console.log('ClientChat: No hay datos de conversaciones o no es array', conversacionesData);
      return [];
    }

    console.log('ClientChat: Total conversaciones recibidas:', conversacionesData.length);
    console.log('ClientChat: Cliente ID para filtrar:', clienteId);

    // Filtrar solo las conversaciones donde este cliente está participando
    const conversacionesFiltradas = conversacionesData.filter((conv: Conversacion) => {
      console.log('Conversación:', {
        id: conv.id,
        cliente_id: conv.cliente_id,
        arquitecto_id: conv.arquitecto_id,
        comparando_con: clienteId
      });
      
      const match = String(conv.cliente_id) === String(clienteId);
      console.log(`Match: ${match}`);
      return match;
    });

    console.log('ClientChat: Conversaciones filtradas:', conversacionesFiltradas.length);

    return conversacionesFiltradas.map((conv: Conversacion) => {
      // Para clientes, el otro participante es el arquitecto
      const otroParticipante = conv.arquitecto;
      const nombre = otroParticipante?.usuario 
        ? `${otroParticipante.usuario.nombre} ${otroParticipante.usuario.apellido}`
        : 'Arquitecto';
      
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
        ultimoMensaje: 'Click to view conversation',
        timestamp,
        online: false,
        unread: 0
      };
    });
  }, [conversacionesData, clienteId]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Abrir conversación automáticamente si viene del botón "Contactar"
  useEffect(() => {
    const state = location.state as any;
    if (state?.conversacionId && state?.autoOpen && conversations.length > 0) {
      const conversacionExiste = conversations.find(c => c.id === state.conversacionId);
      if (conversacionExiste) {
        handleSelectConversation(state.conversacionId);
        // Limpiar el state para que no se abra de nuevo al recargar
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, conversations]);

  const handleSelectConversation = (conversacionId: string) => {
    setChatOpen(false);
    setTimeout(() => {
      setSelectedConversation(conversacionId);
      setChatOpen(true);
    }, 100);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (loadingConversaciones) {
    return (
      <div className="client-chat-page">
        <div className="chat-container-wrapper">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Cargando conversaciones...</p>
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
            <p>Error: {errorConversaciones.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredConversations = conversations.filter(conv =>
    conv.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <p>Elige una conversación de la lista para comenzar a chatear con arquitectos</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


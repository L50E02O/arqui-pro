import { useState, useEffect } from 'react';
import { Chat } from '../components/Chat';
import { useConversaciones } from '../hooks/useApiWithCache';
import '../styles/Chat.css';

interface Conversacion {
  id: string;
  cliente_id: string;
  arquitecto_id: string;
  proyecto_id: string;
  created_at: string;
  updated_at: string;
  cliente?: {
    id: string;
    nombre: string;
    email: string;
  };
  arquitecto?: {
    id: string;
    nombre: string;
    email: string;
  };
}

const ChatExample = () => {
  const [selectedConversacion, setSelectedConversacion] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userDataStr = localStorage.getItem('user_data');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      setCurrentUser(userData);
    }
  }, []);

  const usuarioId = currentUser?.id || '';
  const { data: conversaciones, loading, error } = useConversaciones(usuarioId);

  // Asegurar que conversaciones sea un array
  const conversacionesList = Array.isArray(conversaciones) ? conversaciones : [];

  const handleSelectConversacion = (conversacionId: string) => {
    setChatOpen(false);
    setTimeout(() => {
      setSelectedConversacion(conversacionId);
      setChatOpen(true);
    }, 100);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setSelectedConversacion(null);
  };

  if (!currentUser) {
    return <div className="chat-example-container">Cargando usuario...</div>;
  }

  return (
    <div className="chat-example-container">
      <div className="conversations-sidebar">
        <h2 style={{ color: '#ff6b35', marginBottom: '20px' }}>Mis Conversaciones</h2>
        
        {loading && <p>Cargando conversaciones...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
        
        {!loading && !error && conversacionesList.length === 0 && (
          <p>No tienes conversaciones activas</p>
        )}
        
        {!loading && !error && conversacionesList.length > 0 && (
          <div className="conversations-list">
            {conversacionesList.map((conv: Conversacion) => {
              const isArquitecto = currentUser.rol === 'arquitecto';
              const otroParticipante = isArquitecto 
                ? conv.cliente 
                : conv.arquitecto;

              return (
                <button
                  key={conv.id}
                  className={`conversation-item ${selectedConversacion === conv.id ? 'active' : ''}`}
                  onClick={() => handleSelectConversacion(conv.id)}
                  style={{
                    backgroundColor: selectedConversacion === conv.id ? '#ff6b35' : '#f5f5f5',
                    color: selectedConversacion === conv.id ? 'white' : '#333',
                    border: 'none',
                    padding: '15px',
                    margin: '10px 0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div>
                    <strong>{otroParticipante?.nombre || 'Usuario'}</strong>
                  </div>
                  <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
                    {otroParticipante?.email || ''}
                  </div>
                  <div style={{ fontSize: '0.8em', opacity: 0.6, marginTop: '5px' }}>
                    ID: {conv.id.substring(0, 8)}...
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="chat-main-area">
        {!chatOpen && (
          <div className="chat-placeholder">
            <p>Selecciona una conversación para empezar a chatear</p>
          </div>
        )}
        
        {chatOpen && selectedConversacion && (
          <Chat
            conversacionId={selectedConversacion}
            usuarioId={currentUser.id}
            onClose={handleCloseChat}
          />
        )}
      </div>

      <style>{`
        .chat-example-container {
          display: flex;
          height: 100vh;
          background: #f0f2f5;
        }

        .conversations-sidebar {
          width: 350px;
          background: white;
          border-right: 1px solid #e0e0e0;
          padding: 20px;
          overflow-y: auto;
        }

        .conversations-list {
          margin-top: 10px;
        }

        .conversation-item:hover {
          transform: translateX(5px);
          box-shadow: 0 2px 8px rgba(255, 107, 53, 0.2);
        }

        .chat-main-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f2f5;
        }

        .chat-placeholder {
          text-align: center;
          color: #666;
          font-size: 1.1em;
        }

        @media (max-width: 768px) {
          .chat-example-container {
            flex-direction: column;
          }
          
          .conversations-sidebar {
            width: 100%;
            max-height: 40vh;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatExample;

/**
 * AI Chat Page
 * Página dedicada para el asistente IA
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AIChat from '../components/AIChat';
import '../styles/AIChatPage.css';

export function AIChatPage() {
  const navigate = useNavigate();
  
  // Obtener userId del localStorage (ajustar según tu auth)
  const userId = localStorage.getItem('userId') || 'guest';
  const userRole = localStorage.getItem('userRole') as 'cliente' | 'arquitecto' | 'moderador' || 'cliente';

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const isAuthenticated = localStorage.getItem('authToken');
    if (!isAuthenticated) {
      // Redirigir al login si no está autenticado (opcional)
      // navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="ai-chat-page">
      <div className="ai-chat-page-container">
        <AIChat 
          userId={userId}
          userRole={userRole}
          enableWebSocket={true}
        />
      </div>
    </div>
  );
}

export default AIChatPage;

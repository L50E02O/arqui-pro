/**
 * AI Chat Floating Button
 * Botón flotante para acceso rápido al chat con IA
 */

import { useState } from 'react';
import { Bot, X, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AIChat from './AIChat';
import '../styles/AIChatFloat.css';

interface AIChatFloatProps {
  userId: string;
  userRole?: 'cliente' | 'arquitecto' | 'moderador';
  mode?: 'float' | 'redirect'; // float: modal, redirect: navegar a página
}

export function AIChatFloat({ userId, userRole, mode = 'float' }: AIChatFloatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    if (mode === 'redirect') {
      navigate('/ai-chat');
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button 
        className="ai-chat-float-btn"
        onClick={handleToggle}
        title="Asistente IA"
        aria-label="Abrir asistente IA"
      >
        {isOpen && mode === 'float' ? (
          <X size={24} />
        ) : (
          <Bot size={24} />
        )}
        <span className="ai-chat-float-badge">
          <MessageSquare size={12} />
        </span>
      </button>

      {/* Modal del chat */}
      {isOpen && mode === 'float' && (
        <div className="ai-chat-float-modal">
          <AIChat 
            userId={userId}
            userRole={userRole}
            onClose={() => setIsOpen(false)}
            enableWebSocket={true}
          />
        </div>
      )}
    </>
  );
}

export default AIChatFloat;

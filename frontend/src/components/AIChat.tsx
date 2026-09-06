/**
 * AI Chatbot Component
 * Asistente inteligente con IA multimodal
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Bot, Loader, Wrench, Clock } from 'lucide-react';
import { useAIChat } from '../hooks/useAIChat';
import type { ToolExecution } from '../services/api/aiChatService';
import '../styles/AIChat.css';

interface AIChatProps {
  userId: string;
  userRole?: 'cliente' | 'arquitecto' | 'moderador';
  onClose?: () => void;
  enableWebSocket?: boolean;
}

export function AIChat({ userId, userRole, onClose, enableWebSocket = false }: AIChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    sendMultimodalMessage
  } = useAIChat({
    userId,
    userRole,
    enableWebSocket
  });

  // Auto-scroll al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Manejar envío de mensaje
  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedFile) return;

    if (selectedFile) {
      await sendMultimodalMessage(inputMessage, selectedFile);
      setSelectedFile(null);
      setFilePreview(null);
    } else {
      await sendMessage(inputMessage);
    }

    setInputMessage('');
  };

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes (JPG, PNG, WebP) y PDFs');
      return;
    }

    // Validar tamaño (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('El archivo no debe superar 10MB');
      return;
    }

    setSelectedFile(file);

    // Crear preview para imágenes
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // Remover archivo seleccionado
  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Formatear timestamp
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="ai-chat-container">
      {/* Header */}
      <div className="ai-chat-header">
        <div className="ai-chat-header-info">
          <Bot className="ai-chat-icon" />
          <div>
            <h3 className="ai-chat-title">Asistente IA ArquiPro</h3>
            <p className="ai-chat-status">
              {isConnected ? (
                <><span className="status-dot status-online"></span> Conectado (WebSocket)</>
              ) : (
                <><span className="status-dot status-offline"></span> HTTP</>
              )}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="ai-chat-close-btn" aria-label="Cerrar">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="ai-chat-messages">
        {messages.length === 0 && (
          <div className="ai-chat-welcome">
            <Bot size={48} className="welcome-icon" />
            <h4>¡Hola! Soy tu asistente IA</h4>
            <p>Puedo ayudarte con:</p>
            <ul className="welcome-features">
              <li>🔍 Buscar arquitectos por especialidad y ubicación</li>
              <li>📊 Ver estadísticas y métricas de proyectos</li>
              <li>📝 Crear solicitudes de proyectos</li>
              <li>📈 Consultar avances de proyectos</li>
              <li>🖼️ Analizar imágenes y documentos PDF</li>
            </ul>
            <p className="welcome-tip">Escribe tu consulta o sube un archivo para comenzar</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`ai-message ai-message-${msg.sender}`}>
            <div className="ai-message-content">
              <p>{msg.content}</p>
              
              {/* Tools ejecutadas */}
              {msg.tools_executed && msg.tools_executed.length > 0 && (
                <div className="ai-tools-executed">
                  <button 
                    className="ai-tools-toggle"
                    onClick={() => setShowToolsPanel(!showToolsPanel)}
                  >
                    <Wrench size={14} />
                    {msg.tools_executed.length} herramienta{msg.tools_executed.length > 1 ? 's' : ''} ejecutada{msg.tools_executed.length > 1 ? 's' : ''}
                  </button>
                  
                  {showToolsPanel && (
                    <div className="ai-tools-panel">
                      {msg.tools_executed.map((tool: ToolExecution, idx: number) => (
                        <div key={idx} className="ai-tool-item">
                          <div className="ai-tool-header">
                            <span className="ai-tool-name">{tool.tool_name}</span>
                            <span className={`ai-tool-status ${tool.success ? 'success' : 'error'}`}>
                              {tool.success ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="ai-tool-time">
                            <Clock size={12} />
                            {tool.execution_time_ms}ms
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Loading indicator */}
              {msg.isLoading && (
                <Loader className="ai-message-loading" size={16} />
              )}
            </div>
            
            <span className="ai-message-time">{formatTime(msg.timestamp)}</span>
          </div>
        ))}

        {/* Error message */}
        {error && (
          <div className="ai-error-message">
            <p>⚠️ {error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="ai-file-preview">
          {filePreview ? (
            <img src={filePreview} alt="Preview" className="ai-file-preview-image" />
          ) : (
            <div className="ai-file-preview-doc">
              <Paperclip size={24} />
              <span>{selectedFile.name}</span>
            </div>
          )}
          <button onClick={removeFile} className="ai-file-remove" aria-label="Remover archivo">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="ai-chat-input-area">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          className="ai-file-input-hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="ai-attach-btn"
          disabled={isLoading}
          title="Adjuntar imagen o PDF"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          placeholder={selectedFile ? "Describe tu consulta sobre el archivo..." : "Escribe tu consulta..."}
          className="ai-chat-input"
          disabled={isLoading}
        />

        <button
          onClick={handleSendMessage}
          disabled={isLoading || (!inputMessage.trim() && !selectedFile)}
          className="ai-send-btn"
          title="Enviar mensaje"
        >
          {isLoading ? (
            <Loader className="ai-btn-loading" size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
}

export default AIChat;

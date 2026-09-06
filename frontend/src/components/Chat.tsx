import { useState, useEffect, useRef } from 'react';
import { Send, Loader, FolderPlus, ImageIcon, X, Trash2 } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import conversacionesService from '../services/api/conversacionesService';
import type { Mensaje } from '../types/mensaje.types';
import supabaseStorage from '../services/supabaseStorage';
import '../styles/Chat.css';

interface ChatProps {
  conversacionId: string;
  usuarioId: string;
  onClose?: () => void;
  userRole?: 'arquitecto' | 'cliente';
  clienteInfo?: {
    id: string;
    nombre: string;
  };
  onCreateProject?: () => void;
  onDeleteConversation?: () => void;
}

export function Chat({ conversacionId, usuarioId, onClose, userRole, clienteInfo, onCreateProject, onDeleteConversation }: ChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isTypingTimeout, setIsTypingTimeout] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    mensajes,
    isConnected,
    isTyping,
    sendMessage,
    notifyTyping
  } = useChat({ conversacionId, usuarioId });

  // FILTRAR mensajes que pertenecen solo a ESTA conversación
  const mensajesFiltrados = mensajes.filter(m => m.conversacion_id === conversacionId);

  // Scroll automático al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajesFiltrados]);

  // Manejar selección de imágenes
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setSelectedImages(prev => [...prev, ...newFiles]);

    // Crear previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagesPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remover imagen
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Subir imagen a Supabase Storage
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const timestamp = Date.now()
      const fileName = `mensajes/${conversacionId}/${timestamp}_${file.name}`
      
      const imagenUrl = await supabaseStorage.uploadImagen(file, fileName)
      return imagenUrl
    } catch (error) {
      console.error('Error al subir imagen:', error)
      throw new Error('No se pudo subir la imagen')
    }
  };

  // Eliminar conversación
  const handleDeleteConversation = async () => {
    if (!conversacionId) return;
    
    setIsDeleting(true);
    try {
      await conversacionesService.delete(conversacionId);
      console.log('✅ Conversación eliminada');
      
      // Notificar al componente padre para que actualice la lista
      if (onDeleteConversation) {
        onDeleteConversation();
      }
      
      // Cerrar el chat
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('❌ Error eliminando conversación:', error);
      alert('No se pudo eliminar la conversación');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Manejar envío de mensaje
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() && selectedImages.length === 0) return;

    // Si hay imágenes, subirlas primero
    let imageUrls: string[] = [];
    if (selectedImages.length > 0) {
      imageUrls = await Promise.all(selectedImages.map(file => uploadImage(file)));
    }

    // Enviar mensaje con imágenes (contenido vacío si solo hay imágenes)
    await sendMessage(inputMessage.trim() || '', imageUrls);
    setInputMessage('');
    setSelectedImages([]);
    setImagesPreviews([]);
    
    // Cancelar el indicador de escritura
    notifyTyping(false);
    if (isTypingTimeout) {
      clearTimeout(isTypingTimeout);
    }
  };

  // Manejar escritura
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);

    // Notificar que está escribiendo
    notifyTyping(true);

    // Cancelar timeout anterior
    if (isTypingTimeout) {
      clearTimeout(isTypingTimeout);
    }

    // Programar cancelación del indicador
    const timeout = window.setTimeout(() => {
      notifyTyping(false);
    }, 2000);
    
    setIsTypingTimeout(timeout);
  };

  // Formatear fecha
  const formatTime = (mensaje: Mensaje) => {
    // Si existe hora_envio, usarla directamente
    if (mensaje.hora_envio) {
      const [horas, minutos] = mensaje.hora_envio.split(':');
      return `${horas}:${minutos}`;
    }
    // Fallback a fecha_envio si no hay hora_envio
    const date = new Date(mensaje.fecha_envio);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // Obtener iniciales para avatar
  const getInitials = (nombre: string) => {
    if (!nombre) return 'U';
    const names = nombre.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <h3>{clienteInfo ? clienteInfo.nombre : 'Chat'}</h3>
          <span className={`chat-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        <div className="chat-header-actions">
          {userRole === 'arquitecto' && onCreateProject && (
            <button onClick={onCreateProject} className="create-project-btn">
              <FolderPlus size={18} />
              Crear Proyecto
            </button>
          )}
          <button 
            onClick={() => setShowDeleteModal(true)} 
            className="delete-chat-btn"
            title="Eliminar conversación"
          >
            <Trash2 size={18} />
          </button>
          {onClose && (
            <button onClick={onClose} className="chat-close-btn">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div className="chat-messages">
        {mensajesFiltrados.length === 0 ? (
          <div className="chat-empty">
            <p>No hay mensajes aún. ¡Envía el primero!</p>
          </div>
        ) : (
          mensajesFiltrados.map((mensaje: Mensaje) => {
            const isOwnMessage = mensaje.remitente_id === usuarioId;
            
            // DEBUG: Ver estructura del mensaje
            console.log('📩 Mensaje:', mensaje);
            console.log('   remitente_id:', mensaje.remitente_id);
            console.log('   remitente objeto:', mensaje.remitente);
            console.log('   usuarioId actual:', usuarioId);
            
            const senderName = mensaje.remitente?.nombre || 'Usuario';
            
            return (
              <div
                key={mensaje.id}
                className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}
              >
                {/* Avatar */}
                <div className="message-avatar">
                  {getInitials(senderName)}
                </div>

                {/* Contenido del mensaje */}
                <div className="message-content-wrapper">
                  {/* Solo mostrar el contenido si no está vacío */}
                  {mensaje.contenido && mensaje.contenido.trim() && (
                    <div className="message-content">
                      {mensaje.contenido}
                    </div>
                  )}
                  
                  {/* Imágenes del mensaje */}
                  {mensaje.imagenes && mensaje.imagenes.length > 0 && (
                    <div className="message-images">
                      {mensaje.imagenes.map((imagen, index) => (
                        <img
                          key={imagen.id || index}
                          src={imagen.imagen_url}
                          alt={`Imagen ${index + 1}`}
                          className="message-image"
                        />
                      ))}
                    </div>
                  )}
                  
                  <span className="message-time">
                    {formatTime(mensaje)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        
        {/* Indicador de escritura */}
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-indicator-avatar">
              ...
            </div>
            <div className="typing-indicator-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-container">
        {/* Previews de imágenes seleccionadas */}
        {imagesPreviews.length > 0 && (
          <div className="images-preview">
            {imagesPreviews.map((preview, index) => (
              <div key={index} className="image-preview-item">
                <img src={preview} alt={`Preview ${index}`} />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => removeImage(index)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="chat-attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected}
            title="Adjuntar imagen"
          >
            <ImageIcon size={20} />
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Escribe un mensaje..."
            className="chat-input"
            disabled={!isConnected}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!isConnected || (!inputMessage.trim() && selectedImages.length === 0)}
          >
            {isConnected ? <Send size={20} /> : <Loader size={20} className="spinning" />}
          </button>
        </form>
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>¿Eliminar conversación?</h3>
              <button onClick={() => setShowDeleteModal(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Esta acción no se puede deshacer. Se eliminarán todos los mensajes de esta conversación.</p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="modal-btn-cancel"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteConversation} 
                className="modal-btn-delete"
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook personalizado para AI Chat
 * Maneja la comunicación con el AI Orchestrator
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import aiChatService, { type ChatResponse, type ToolExecution } from '../services/api/aiChatService';

interface UseAIChatProps {
  userId: string;
  conversationId?: string;
  userRole?: 'cliente' | 'arquitecto' | 'moderador';
  enableWebSocket?: boolean;
}

interface AIMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  tools_executed?: ToolExecution[];
  llm_provider?: string;
  isLoading?: boolean;
}

export const useAIChat = ({
  userId,
  conversationId,
  userRole,
  enableWebSocket = false
}: UseAIChatProps) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);

  /**
   * Conectar WebSocket
   */
  useEffect(() => {
    if (!enableWebSocket) return;

    try {
      const ws = aiChatService.createWebSocket(userId);

      ws.onopen = () => {
        console.log('🤖 AI WebSocket conectado');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'response') {
          const aiMessage: AIMessage = {
            id: `ai-${Date.now()}`,
            content: data.content,
            sender: 'ai',
            timestamp: new Date(data.timestamp),
            tools_executed: data.tools_executed,
            llm_provider: data.llm_provider
          };

          setMessages(prev => prev.map(msg => 
            msg.isLoading ? aiMessage : msg
          ));
          setIsLoading(false);
        }
      };

      ws.onerror = (error) => {
        console.error('🤖 AI WebSocket error:', error);
        setError('Error de conexión con el asistente IA');
      };

      ws.onclose = () => {
        console.log('🤖 AI WebSocket desconectado');
        setIsConnected(false);
      };

      wsRef.current = ws;

      return () => {
        ws.close();
      };
    } catch (err) {
      console.error('Error conectando WebSocket:', err);
      setError('No se pudo conectar con el asistente IA');
    }
  }, [userId, enableWebSocket]);

  /**
   * Enviar mensaje de texto
   */
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      content: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Mensaje de carga temporal
    const loadingMessage: AIMessage = {
      id: `loading-${Date.now()}`,
      content: 'Procesando tu consulta...',
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      if (enableWebSocket && wsRef.current?.readyState === WebSocket.OPEN) {
        // Enviar vía WebSocket con contexto
        wsRef.current.send(JSON.stringify({
          type: 'message',
          content: message,
          conversation_id: conversationId,
          context: { rol: userRole }  // Agregar contexto con rol
        }));
      } else {
        // Enviar vía HTTP
        const response: ChatResponse = await aiChatService.sendMessage({
          message,
          user_id: userId,
          conversation_id: conversationId,
          context: { rol: userRole }
        });

        const aiMessage: AIMessage = {
          id: `ai-${Date.now()}`,
          content: response.content,
          sender: 'ai',
          timestamp: new Date(response.timestamp),
          tools_executed: response.tools_executed,
          llm_provider: response.llm_provider
        };

        setMessages(prev => prev.map(msg => 
          msg.isLoading ? aiMessage : msg
        ));
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Error enviando mensaje:', err);
      setError(err.message || 'Error al comunicarse con el asistente IA');
      
      // Remover mensaje de carga y agregar error
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        content: 'Lo siento, ocurrió un error procesando tu mensaje. Por favor intenta nuevamente.',
        sender: 'ai',
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }
  }, [userId, conversationId, userRole, enableWebSocket]);

  /**
   * Enviar mensaje con archivo (multimodal)
   */
  const sendMultimodalMessage = useCallback(async (message: string, file: File) => {
    if (!message.trim() && !file) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      content: message || `[Archivo: ${file.name}]`,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    const loadingMessage: AIMessage = {
      id: `loading-${Date.now()}`,
      content: 'Analizando archivo y procesando consulta...',
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response: ChatResponse = await aiChatService.sendMultimodalMessage(
        message,
        userId,
        file,
        conversationId
      );

      const aiMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        content: response.content,
        sender: 'ai',
        timestamp: new Date(response.timestamp),
        tools_executed: response.tools_executed,
        llm_provider: response.llm_provider
      };

      setMessages(prev => prev.map(msg => 
        msg.isLoading ? aiMessage : msg
      ));
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error enviando mensaje multimodal:', err);
      setError(err.message || 'Error al procesar el archivo');
      
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        content: 'Lo siento, no pude procesar el archivo. Por favor intenta nuevamente.',
        sender: 'ai',
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }
  }, [userId, conversationId]);

  /**
   * Limpiar conversación
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    sendMultimodalMessage,
    clearMessages
  };
};

/**
 * AI Chat Service
 * Servicio para comunicarse con el AI Orchestrator (Pilar 3)
 */

import axios from 'axios';

const AI_BASE_URL = import.meta.env.VITE_AI_ORCHESTRATOR_URL || 'http://localhost:8001';

// ============ TIPOS EXPORTADOS ============
interface ChatMessage {
  message: string;
  user_id: string;
  conversation_id?: string;
  context?: {
    rol?: 'cliente' | 'arquitecto' | 'moderador';
    [key: string]: any;
  };
}

interface ToolExecution {
  tool_name: string;
  params: Record<string, any>;
  result: any;
  success: boolean;
  execution_time_ms: number;
}

interface ChatResponse {
  content: string;
  user_id: string;
  conversation_id?: string;
  tools_executed: ToolExecution[];
  llm_provider: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export type { ChatMessage, ToolExecution, ChatResponse, MCPTool };

class AIChatService {
  private baseURL: string;

  constructor() {
    this.baseURL = AI_BASE_URL;
  }

  /**
   * Health check del AI Orchestrator
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error) {
      console.error('AI Orchestrator health check failed:', error);
      throw error;
    }
  }

  /**
   * Enviar mensaje de texto al chatbot
   */
  async sendMessage(data: ChatMessage): Promise<ChatResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/chat`, data);
      return response.data;
    } catch (error) {
      console.error('Error sending message to AI:', error);
      throw error;
    }
  }

  /**
   * Enviar mensaje multimodal (texto + archivo)
   */
  async sendMultimodalMessage(
    message: string,
    userId: string,
    file: File,
    conversationId?: string
  ): Promise<ChatResponse> {
    try {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('user_id', userId);
      if (conversationId) {
        formData.append('conversation_id', conversationId);
      }
      formData.append('file', file);

      const response = await axios.post(
        `${this.baseURL}/api/v1/chat/multimodal`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending multimodal message:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de MCP Tools disponibles
   */
  async getAvailableTools(): Promise<MCPTool[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/tools`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tools:', error);
      throw error;
    }
  }

  /**
   * Ejecutar una tool directamente (para testing)
   */
  async executeTool(toolName: string, params: Record<string, any>) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/v1/tools/${toolName}/execute`,
        params
      );
      return response.data;
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Crear conexión WebSocket para chat en tiempo real
   */
  createWebSocket(userId: string): WebSocket {
    const wsUrl = this.baseURL.replace('http', 'ws');
    const ws = new WebSocket(`${wsUrl}/ws/chat/${userId}`);
    return ws;
  }
}

export const aiChatService = new AIChatService();
export default aiChatService;

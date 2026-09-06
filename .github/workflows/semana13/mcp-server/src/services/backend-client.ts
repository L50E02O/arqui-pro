/**
 * Servicio de comunicación HTTP con el backend
 * Gestiona todas las llamadas REST al microservicio de verificación
 */

import axios, { AxiosInstance } from 'axios';
import { Verificacion, VerificacionEstado, Arquitecto } from '../types/mcp.types.js';

export class BackendClient {
  private httpClient: AxiosInstance;
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = process.env.BACKEND_BASE_URL || 'http://localhost:3002';
    this.timeout = parseInt(process.env.REQUEST_TIMEOUT || '10000');

    this.httpClient = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Busca verificaciones por criterios
   * @param criterios - Parámetros de búsqueda (id, arquitectoId, estado, etc.)
   * @returns Lista de verificaciones que coinciden
   */
  async buscarVerificaciones(criterios: {
    id?: string;
    arquitectoId?: string;
    estado?: VerificacionEstado;
    limit?: number;
    offset?: number;
  }): Promise<Verificacion[]> {
    try {
      const params = new URLSearchParams();
      if (criterios.id) params.append('id', criterios.id);
      if (criterios.arquitectoId) params.append('arquitectoId', criterios.arquitectoId);
      if (criterios.estado) params.append('estado', criterios.estado);
      if (criterios.limit) params.append('limit', criterios.limit.toString());
      if (criterios.offset) params.append('offset', criterios.offset.toString());

      const response = await this.httpClient.get('/api/verificacion/buscar', {
        params: Object.fromEntries(params),
      });

      // Si es un array, retornarlo; si es un objeto con data, extraer data
      return Array.isArray(response.data)
        ? response.data
        : response.data.data || [response.data];
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Error buscando verificaciones';
      throw new Error(`[BackendClient] Error en buscarVerificaciones: ${message}`);
    }
  }

  /**
   * Obtiene una verificación específica por ID
   * @param id - ID de la verificación
   * @returns La verificación encontrada
   */
  async obtenerVerificacion(id: string): Promise<Verificacion> {
    try {
      const response = await this.httpClient.get(`/api/verificacion/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Error obteniendo verificación';
      throw new Error(`[BackendClient] Error en obtenerVerificacion: ${message}`);
    }
  }

  /**
   * Verifica si una verificación está en estado PENDIENTE
   * @param id - ID de la verificación
   * @returns true si está pendiente, false en otro caso
   */
  async esPendiente(id: string): Promise<boolean> {
    try {
      const verificacion = await this.obtenerVerificacion(id);
      return verificacion.estado === 'pendiente';
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Error verificando estado';
      throw new Error(`[BackendClient] Error en esPendiente: ${message}`);
    }
  }

  /**
   * Actualiza el estado de una verificación
   * @param id - ID de la verificación
   * @param nuevoEstado - Nuevo estado a asignar
   * @param razon - Razón opcional del cambio de estado
   * @returns La verificación actualizada
   */
  async cambiarEstado(
    id: string,
    nuevoEstado: VerificacionEstado,
    razon?: string,
  ): Promise<Verificacion> {
    try {
      const payload: any = {
        estado: nuevoEstado,
      };

      if (razon) {
        payload.razon = razon;
      }

      const response = await this.httpClient.patch(
        `/api/verificacion/${id}`,
        payload,
      );

      return response.data.data || response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Error actualizando verificación';
      throw new Error(`[BackendClient] Error en cambiarEstado: ${message}`);
    }
  }

  /**
   * Obtiene información del arquitecto asociado a una verificación
   * @param arquitectoId - ID del arquitecto
   * @returns Información del arquitecto
   */
  async obtenerArquitecto(arquitectoId: string): Promise<Arquitecto> {
    try {
      const response = await this.httpClient.get(`/api/arquitecto/${arquitectoId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Error obteniendo arquitecto';
      throw new Error(`[BackendClient] Error en obtenerArquitecto: ${message}`);
    }
  }

  /**
   * Valida la conexión con el backend
   * @returns true si el backend es accesible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/health', {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.error('[BackendClient] Health check falló:', error);
      return false;
    }
  }
}

// Instancia singleton para usar en las tools
export const backendClient = new BackendClient();

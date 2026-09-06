import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ValoracionesService {
  private readonly apiUrl = process.env.APIREST_URL || 'http://localhost:3000';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtener todas las valoraciones de un proyecto
   */
  async obtenerValoracionesPorProyecto(proyectoId: string, authorization?: string) {
    try {
      const headers: Record<string, string> = {};
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/api/v1/proyectos/${proyectoId}/valoraciones`, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al obtener valoraciones: ${errorMessage}`);
    }
  }

  /**
   * Obtener todas las valoraciones de un cliente
   */
  async obtenerValoracionesPorCliente(clienteId: string, authorization?: string) {
    try {
      const headers: Record<string, string> = {};
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/api/v1/valoraciones?cliente_id=${clienteId}`, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al obtener valoraciones del cliente: ${errorMessage}`);
    }
  }

  /**
   * Obtener una valoración por ID
   */
  async obtenerValoracionPorId(valoracionId: string, authorization?: string) {
    try {
      const headers: Record<string, string> = {};
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/api/v1/valoraciones/${valoracionId}`, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al obtener valoración: ${errorMessage}`);
    }
  }

  /**
   * Crear una nueva valoración
   */
  async crearValoracion(datos: {
    calificacion: number;
    comentario: string;
    cliente_id: string;
    proyecto_id: string;
  }, authorization?: string) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/api/v1/valoraciones`, { valoracion: datos }, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al crear valoración: ${errorMessage}`);
    }
  }

  /**
   * Actualizar una valoración
   */
  async actualizarValoracion(valoracionId: string, datos: any, authorization?: string) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.put(`${this.apiUrl}/api/v1/valoraciones/${valoracionId}`, { valoracion: datos }, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al actualizar valoración: ${errorMessage}`);
    }
  }

  /**
   * Eliminar una valoración
   */
  async eliminarValoracion(valoracionId: string, authorization?: string) {
    try {
      const headers: Record<string, string> = {};
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.delete(`${this.apiUrl}/api/v1/valoraciones/${valoracionId}`, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al eliminar valoración: ${errorMessage}`);
    }
  }
}

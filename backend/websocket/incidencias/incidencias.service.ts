import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IncidenciasService {
  private readonly apiUrl = process.env.APIREST_URL || 'http://localhost:3000';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtener todas las incidencias (con filtros opcionales)
   */
  async obtenerIncidencias(filtros?: {
    estado?: string;
    usuario_emisor_id?: string;
    usuario_infractor_id?: string;
    moderador_id?: string;
  }, authorization?: string) {
    try {
      const headers: Record<string, string> = {};
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const params = new URLSearchParams();
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const url = `${this.apiUrl}/api/v1/incidencias${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await firstValueFrom(
        this.httpService.get(url, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al obtener incidencias: ${errorMessage}`);
    }
  }

  /**
   * Obtener una incidencia por ID
   */
  async obtenerIncidenciaPorId(incidenciaId: string, authorization?: string) {
    try {
      const headers: Record<string, string> = {};
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/api/v1/incidencias/${incidenciaId}`, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al obtener incidencia: ${errorMessage}`);
    }
  }

  /**
   * Crear una nueva incidencia
   */
  async crearIncidencia(datos: {
    descripcion: string;
    usuario_emisor_id: string;
    usuario_infractor_id: string;
    imagenes?: string[];
  }, authorization?: string) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/api/v1/incidencias`, { incidencia: datos }, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al crear incidencia: ${errorMessage}`);
    }
  }

  /**
   * Actualizar una incidencia
   */
  async actualizarIncidencia(incidenciaId: string, datos: any, authorization?: string) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.put(`${this.apiUrl}/api/v1/incidencias/${incidenciaId}`, { incidencia: datos }, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al actualizar incidencia: ${errorMessage}`);
    }
  }

  /**
   * Resolver una incidencia
   */
  async resolverIncidencia(incidenciaId: string, moderadorId: string, authorization?: string) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.apiUrl}/api/v1/incidencias/${incidenciaId}/resolver`,
          { moderador_id: moderadorId },
          { headers }
        ),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al resolver incidencia: ${errorMessage}`);
    }
  }
}

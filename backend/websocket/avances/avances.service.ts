import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AvancesService {
  private readonly apiUrl = process.env.APIREST_URL || 'http://localhost:3000';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtener todos los avances de un proyecto
   */
  async obtenerAvancesPorProyecto(proyectoId: string, authorization?: string) {
    try {
      const headers: Record<string, string> = {};
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/api/v1/proyectos/${proyectoId}/avances`, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al obtener avances: ${errorMessage}`);
    }
  }

  /**
   * Obtener un avance por ID
   */
  async obtenerAvancePorId(avanceId: string, authorization?: string) {
    try {
      const headers: Record<string, string> = {};
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/api/v1/avances/${avanceId}`, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al obtener avance: ${errorMessage}`);
    }
  }

  /**
   * Crear un nuevo avance
   */
  async crearAvance(datos: {
    descripcion: string;
    fecha: string;
    proyecto_id: string;
    imagenes?: string[];
  }, authorization?: string) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/api/v1/avances`, { avance: datos }, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al crear avance: ${errorMessage}`);
    }
  }

  /**
   * Actualizar un avance
   */
  async actualizarAvance(avanceId: string, datos: any, authorization?: string) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.put(`${this.apiUrl}/api/v1/avances/${avanceId}`, { avance: datos }, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al actualizar avance: ${errorMessage}`);
    }
  }

  /**
   * Eliminar un avance
   */
  async eliminarAvance(avanceId: string, authorization?: string) {
    try {
      const headers: Record<string, string> = {};
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.delete(`${this.apiUrl}/api/v1/avances/${avanceId}`, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al eliminar avance: ${errorMessage}`);
    }
  }
}

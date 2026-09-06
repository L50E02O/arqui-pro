import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProyectoService {
  private readonly apiUrl = process.env.APIREST_URL || 'http://localhost:3000';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtener todos los proyectos de un arquitecto
   */
  async obtenerProyectosPorArquitecto(arquitectoId: string, authorization?: string) {
    try {
      const headers: Record<string, string> = {};
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/api/v1/proyectos?arquitecto_id=${arquitectoId}`, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al obtener proyectos del arquitecto: ${errorMessage}`);
    }
  }

  /**
   * Obtener todos los proyectos de un cliente
   */
  async obtenerProyectosPorCliente(clienteId: string, authorization?: string) {
    try {
      const headers: Record<string, string> = {};
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/api/v1/proyectos?cliente_id=${clienteId}`, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al obtener proyectos del cliente: ${errorMessage}`);
    }
  }

  /**
   * Obtener un proyecto por ID
   */
  async obtenerProyectoPorId(proyectoId: string, authorization?: string) {
    try {
      const headers: Record<string, string> = {};
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/api/v1/proyectos/${proyectoId}`, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al obtener proyecto: ${errorMessage}`);
    }
  }

  /**
   * Crear un nuevo proyecto
   */
  async crearProyecto(datos: {
    titulo_proyecto: string;
    descripcion: string;
    tipo_proyecto: 'portafolio' | 'contratado';
    arquitecto_id: string;
    cliente_id?: string;
  }, authorization?: string) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/api/v1/proyectos`, { proyecto: datos }, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al crear proyecto: ${errorMessage}`);
    }
  }

  /**
   * Actualizar un proyecto
   */
  async actualizarProyecto(proyectoId: string, datos: any, authorization?: string) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.put(`${this.apiUrl}/api/v1/proyectos/${proyectoId}`, { proyecto: datos }, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al actualizar proyecto: ${errorMessage}`);
    }
  }
}

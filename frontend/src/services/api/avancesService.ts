import axiosInstance from './axiosInstance';
import type { Avance } from '../../types/avance.types';

interface CreateAvanceData {
  descripcion: string;
  fecha: string;
  proyecto_id: string;
  imagenes?: { url: string }[];
}

interface UpdateAvanceData {
  descripcion?: string;
  fecha?: string;
}

class AvancesService {
  private readonly BASE_URL = '/avances';

  async createAvance(data: CreateAvanceData): Promise<Avance> {
    const response = await axiosInstance.post(this.BASE_URL, { avance: data });
    return response.data;
  }

  async getAvances(): Promise<Avance[]> {
    const response = await axiosInstance.get(this.BASE_URL);
    return response.data;
  }

  async getAvance(id: string): Promise<Avance> {
    const response = await axiosInstance.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  async getAvancesByProyecto(proyectoId: string): Promise<Avance[]> {
    const response = await axiosInstance.get(`${this.BASE_URL}?proyecto_id=${proyectoId}`);
    return response.data;
  }

  async updateAvance(id: string, data: UpdateAvanceData): Promise<Avance> {
    const response = await axiosInstance.put(`${this.BASE_URL}/${id}`, { avance: data });
    return response.data;
  }

  async deleteAvance(id: string): Promise<void> {
    await axiosInstance.delete(`${this.BASE_URL}/${id}`);
  }
}

export default new AvancesService();

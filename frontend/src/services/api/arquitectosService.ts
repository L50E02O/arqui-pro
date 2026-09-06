import axiosInstance from './axiosInstance';
import { CacheService } from '../../utils/cacheService';
import type { Arquitecto, UpdateArquitectoDto } from '../../types/arquitecto.types';

export interface ArquitectoFilters {
  especialidad?: string;
  verificado?: boolean;
  valoracion_minima?: number;
  page?: number;
  per_page?: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

class ArquitectosService {
  async getAll(filters?: ArquitectoFilters): Promise<Arquitecto[]> {
    const params = new URLSearchParams();

    if (filters?.especialidad) params.append('especialidad', filters.especialidad);
    if (filters?.verificado !== undefined) params.append('verificado', String(filters.verificado));
    if (filters?.valoracion_minima) params.append('valoracion_minima', String(filters.valoracion_minima));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.per_page) params.append('per_page', String(filters.per_page));

    const response = await axiosInstance.get(`/arquitectos?${params.toString()}`);
    return response.data;
  }

  async getById(id: string): Promise<Arquitecto> {
    const cacheKey = `arquitecto_${id}_cache`;
    const cached = CacheService.get<Arquitecto>(cacheKey, undefined, CACHE_DURATION);
    if (cached) {
      return cached;
    }

    const response = await axiosInstance.get(`/arquitectos/${id}`);
    CacheService.set(cacheKey, response.data);
    return response.data;
  }

  async update(id: string, arquitecto: UpdateArquitectoDto): Promise<Arquitecto> {
    const response = await axiosInstance.put(`/arquitectos/${id}`, arquitecto);
    const cacheKey = `arquitecto_${id}_cache`;
    CacheService.set(cacheKey, response.data);
    this.clearCache();
    return response.data;
  }

  async incrementVistas(id: string): Promise<void> {
    try {
      await axiosInstance.post(`/arquitectos/${id}/incrementar_vistas`);
    } catch {
      // Fallback si no existe la ruta especifica
      const current = await this.getById(id);
      if (current) {
        await this.update(id, { vistas_perfil: (current.vistas_perfil || 0) + 1 });
      }
    }
  }

  async getVerificados(): Promise<Arquitecto[]> {
    const cacheKey = 'arquitectos_verificados_cache';
    const cached = CacheService.get<Arquitecto[]>(cacheKey, undefined, CACHE_DURATION);
    if (cached) {
      return cached;
    }

    const response = await axiosInstance.get('/arquitectos?verificado=true');
    CacheService.set(cacheKey, response.data);
    return response.data;
  }

  async search(query: string): Promise<Arquitecto[]> {
    const cacheKey = 'arquitectos_search_cache';
    const cached = CacheService.get<Arquitecto[]>(cacheKey, { query }, CACHE_DURATION);
    if (cached) {
      return cached;
    }

    const response = await axiosInstance.get(`/arquitectos/search?q=${query}`);
    CacheService.set(cacheKey, response.data, { query });
    return response.data;
  }

  clearCache(): void {
    CacheService.remove('arquitectos_all_cache');
    CacheService.remove('arquitectos_verificados_cache');
    CacheService.remove('arquitectos_search_cache');
  }
}

export default new ArquitectosService();

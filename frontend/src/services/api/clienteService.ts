import axiosInstance from "./axiosInstance"
import type { Cliente, UpdateClienteDto } from "../../types/cliente.types"
import { CacheService } from '../../utils/cacheService'

const CACHE_DURATION = 3 * 60 * 1000;

class ClienteService {
    async getAll(): Promise<Cliente[]>{
        const response = await axiosInstance.get("/clientes");
        return Array.isArray(response.data) ? response.data : response.data.proyectos || [];
    }

    async getById(id: string): Promise<Cliente> {
        const cacheKey = `cliente_${id}_cache`
        const cached = CacheService.get<Cliente>(cacheKey, undefined, CACHE_DURATION)
        if (cached) {
            console.log(`Usando cliente ${id} desde caché`)
            return cached
        }

        console.log(`Obteniendo cliente ${id} desde API REST`)
        const response = await axiosInstance.get(`/clientes/${id}`)
        
        CacheService.set(cacheKey, response.data)
        return response.data
    }    

    async update(id: string, cliente: UpdateClienteDto): Promise<Cliente> {
        console.log(`Actualizando cliente ${id} en API REST`)
        const response = await axiosInstance.put(`/clientes/${id}`, cliente)
        this.clearCache()
        return response.data
    }

    async delete(id: string): Promise<void> {
        console.log(`Eliminando cliente ${id} en API REST`)
        await axiosInstance.delete(`/clientes/${id}`)
        this.clearCache()
    }

    clearCache(): void {
        CacheService.clearByPattern('clientes_')
        CacheService.clearByPattern('cliente_')
        console.log('Caché de clientes limpiado')
    }
}

export default new ClienteService();
import axiosInstance from './axiosInstance'
import type { Cliente, SolicitudProyecto } from '../../types'
import { CacheService } from '../../utils/cacheService'
import clienteService from './clienteService'

const CACHE_DURATION = 2 * 60 * 1000 // 2 minutos (datos más dinámicos)

class SolicitudesService {
  async getAll(): Promise<SolicitudProyecto[]> {
    const response = await axiosInstance.get('/solicitudes_proyecto')
    return Array.isArray(response.data) ? response.data : response.data.proyectos || []
  }

  async getByUsuarioCliente(usuarioId: string): Promise<SolicitudProyecto[]> {

    const clientes: Cliente[] = await clienteService.getAll();
    const clienteUsuario = clientes.find((cliente)=> cliente.usuario?.id===usuarioId);
    console.log(`Obteniendo solicitudes_proyecto del cliente ${clienteUsuario?.id} desde API REST`);
    const solicitudes = await this.getAll();

    const solicitudesClienteUsuario = solicitudes.filter((solicitudes)=>solicitudes.cliente_id===clienteUsuario?.id);
    return solicitudesClienteUsuario;

  }

  async getById(id: string): Promise<SolicitudProyecto> {
    const cacheKey = `solicitud_${id}_cache`
    const cached = CacheService.get<SolicitudProyecto>(cacheKey, undefined, CACHE_DURATION)
    if (cached) {
      console.log(`Usando solicitud ${id} desde caché`)
      return cached
    }

    console.log(`Obteniendo solicitud ${id} desde API REST`)
    const response = await axiosInstance.get(`/solicitudes_proyectos/${id}`)
    
    CacheService.set(cacheKey, response.data)
    return response.data
  }

  clearCache(): void {
    CacheService.clearByPattern('solicitudes_')
    CacheService.clearByPattern('solicitud_')
    console.log(' Caché de solicitudes limpiado')
  }
}

export default new SolicitudesService()

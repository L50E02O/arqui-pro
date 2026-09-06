import axiosInstance, { axiosPublic } from "./axiosInstance"
import type { Proyecto, CreateProyectoDto, UpdateProyectoDto } from "../../types/proyecto.types"
import { CacheService } from '../../utils/cacheService'
import type { Cliente } from "../../types"
import clienteService from "./clienteService"

const CACHE_DURATION = 3 * 60 * 1000 // 3 minutos

class ProyectosService {
  async getAll(tipoProyecto?: 'portafolio' | 'contratado', usePublic: boolean = false): Promise<Proyecto[]> {
    const params = tipoProyecto ? { tipo_proyecto: tipoProyecto } : {}
    const client = usePublic ? axiosPublic : axiosInstance
    const response = await client.get('/proyectos', { params })
    return Array.isArray(response.data) ? response.data : response.data.proyectos || []
  }

  async getById(id: string): Promise<Proyecto> {
    const cacheKey = `proyecto_${id}_cache`
    const cached = CacheService.get<Proyecto>(cacheKey, undefined, CACHE_DURATION)
    if (cached) {
      console.log(`Usando proyecto ${id} desde caché`)
      return cached
    }

    console.log(`Obteniendo proyecto ${id} desde API REST`)
    const response = await axiosInstance.get(`/proyectos/${id}`)
    
    CacheService.set(cacheKey, response.data)
    return response.data
  }

  async getByCliente(clienteId: string): Promise<Proyecto[]> {
    const cacheKey = `proyectos_cliente_${clienteId}_cache`
    const cached = CacheService.get<Proyecto[]>(cacheKey, undefined, CACHE_DURATION)
    if (cached) {
      console.log(`Usando proyectos del cliente ${clienteId} desde caché`)
      return cached
    }

    console.log(`Obteniendo proyectos del cliente ${clienteId} desde API REST`)
    const response = await axiosInstance.get(`/proyectos?cliente_id=${clienteId}`)
    
    const result = Array.isArray(response.data) ? response.data : response.data.proyectos || []
    CacheService.set(cacheKey, result)
    return result
  }

  async getByUsuarioCliente(usuarioId: string): Promise<Proyecto[]> {
    const clientes: Cliente[] = await clienteService.getAll();
    const clienteUsuario = clientes.find((cliente)=> cliente.usuario?.id===usuarioId);
    console.log(`Obteniendo proyectos del cliente ${clienteUsuario?.id} desde API REST`);
    const responseProyectos = await this.getAll();

    const proyectosClienteUsuario = responseProyectos.filter((proyecto)=> proyecto.cliente_id===clienteUsuario?.id);
    return proyectosClienteUsuario;
  }

  async create(proyecto: CreateProyectoDto): Promise<Proyecto> {
    console.log('Creando proyecto en API REST')
    const response = await axiosInstance.post('/proyectos', proyecto)
    this.clearCache()
    return response.data
  }

  async update(id: string, proyecto: UpdateProyectoDto): Promise<Proyecto> {
    console.log(`Actualizando proyecto ${id} en API REST`, proyecto)
    const response = await axiosInstance.put(`/proyectos/${id}`, { proyecto })
    this.clearCache()
    return response.data
  }

  async delete(id: string): Promise<void> {
    console.log(`Eliminando proyecto ${id} en API REST`)
    await axiosInstance.delete(`/proyectos/${id}`)
    this.clearCache()
  }

  clearCache(): void {
    CacheService.clearByPattern('proyectos_')
    CacheService.clearByPattern('proyecto_')
    console.log('Caché de proyectos limpiado')
  }
}

export default new ProyectosService()

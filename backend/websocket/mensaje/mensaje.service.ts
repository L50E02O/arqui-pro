import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MensajeService {
  private readonly apiUrl = process.env.APIREST_URL || 'http://localhost:3000';

  constructor(private readonly httpService: HttpService) {}

  async crearMensaje(datos: {
    contenido: string;
    emisor_id: string;
    conversacion_id: string;
    tipo: string;
    imagenes?: string[];
  }, authorization?: string) {
    try {
      const ahora = new Date();
      const mensajeData = {
        mensaje: {
          contenido: datos.contenido,
          remitente_id: datos.emisor_id,
          conversacion_id: datos.conversacion_id,
          leido: false,
          fecha_envio: ahora.toISOString().split('T')[0], // Solo fecha YYYY-MM-DD
          hora_envio: ahora.toTimeString().split(' ')[0]  // Solo hora HH:MM:SS
        },
        imagenes: datos.imagenes?.map(url => ({ url })) || []
      };
      
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/api/v1/mensajes`, mensajeData, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al crear mensaje: ${errorMessage}`);
    }
  }

  async obtenerMensajesPorConversacion(conversacionId: string, authorization?: string) {
    try {
      const headers: Record<string, string> = {};
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/api/v1/conversaciones/${conversacionId}/mensajes`, { headers }),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al obtener mensajes: ${errorMessage}`);
    }
  }

  async marcarMensajesComoLeidos(conversacionId: string, usuarioId: string, authorization?: string) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authorization) {
        headers['Authorization'] = authorization;
      }
      
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.apiUrl}/api/v1/conversaciones/${conversacionId}/mensajes/marcar_leidos`,
          { usuario_id: usuarioId },
          { headers }
        ),
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      throw new Error(`Error al marcar mensajes como leídos: ${errorMessage}`);
    }
  }
}
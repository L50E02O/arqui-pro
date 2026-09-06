import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NotificacionService {
	private readonly logger = new Logger(NotificacionService.name);
	constructor(private readonly http: HttpService) {}

	async createNotification(payload: { mensaje: string; usuario_id: number }, authorization?: string) {
		const apiUrl = process.env.APIREST_URL || 'http://localhost:3000';
		const url = `${apiUrl}/api/v1/notificaciones`;
		const headers: Record<string, string> = { 'Content-Type': 'application/json' };
		if (authorization) headers['Authorization'] = authorization;

		const body = { notificacion: { mensaje: payload.mensaje, usuario_id: payload.usuario_id } };
		try {
			const resp$ = this.http.post(url, body, { headers });
			const resp = (await lastValueFrom(resp$)) as any;
			return resp?.data ?? resp;
		} catch (err: any) {
			this.logger.error('Error creating notification in APIREST', err?.message ?? err);
			throw err;
		}
	}

	async markAsRead(notificacion_id: string, authorization?: string) {
		const apiUrl = process.env.APIREST_URL || 'http://localhost:3000';
		const url = `${apiUrl}/api/v1/notificaciones/${notificacion_id}`;
		const headers: Record<string, string> = { 'Content-Type': 'application/json' };
		if (authorization) headers['Authorization'] = authorization;

		const body = { notificacion: { leido: true } };
		try {
			const resp$ = this.http.patch(url, body, { headers });
			const resp = (await lastValueFrom(resp$)) as any;
			return resp?.data ?? resp;
		} catch (err: any) {
			this.logger.error('Error marking notification as read in APIREST', err?.message ?? err);
			throw err;
		}
	}
}

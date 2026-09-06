import { Controller, All, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthProxyController {
    private readonly authServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL', 'http://localhost:4001');
    }

    @All('*')
    async proxyAuth(@Req() req: Request, @Res() res: Response) {
        const path = req.params[0] || '';
        const url = `${this.authServiceUrl}/auth/${path}`;

        console.log(`[Gateway] [PROXY]  Proxying ${req.method} ${req.url} -> ${url}`);

        // Filter out headers that can cause issues when proxying
        const headers = { ...req.headers };
        delete headers.host;
        delete headers['content-length'];

        try {
            const response = await firstValueFrom(
                this.httpService.request({
                    method: req.method,
                    url,
                    data: req.body,
                    headers,
                }),
            );

            console.log(`[Gateway] [SUCCESS]  Response from Auth: ${response.status}`);
            return res.status(response.status).json(response.data);
        } catch (error) {
            console.error(`[Gateway] [ERROR]  Error proxying to Auth: ${error.message}`);
            if (error.response) {
                console.error(`[Gateway] [ERROR]  Auth Service Response: ${JSON.stringify(error.response.data)}`);
                return res.status(error.response.status).json(error.response.data);
            }
            return res.status(500).json({ message: 'Error de conexión con el servicio de autenticación', error: error.message });
        }
    }
}

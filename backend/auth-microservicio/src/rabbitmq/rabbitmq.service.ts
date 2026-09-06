import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
    constructor(
        @Inject('AUTH_SERVICE') private readonly client: ClientProxy,
    ) { }

    async emit(pattern: string, data: any) {
        return this.client.emit(pattern, data);
    }
}

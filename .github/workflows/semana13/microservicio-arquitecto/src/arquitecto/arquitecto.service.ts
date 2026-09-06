import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Arquitecto } from './entities/arquitecto.entity';
import { CreateArquitectoDto } from './dto/create-arquitecto.dto';
import { UpdateArquitectoDto } from './dto/update-arquitecto.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { WebhookService } from '../webhook/webhook.service';

/**
 * Servicio de Arquitecto
 * Maneja la lógica de negocio y publica eventos de dominio
 */
@Injectable()
export class ArquitectoService {
  private readonly logger = new Logger(ArquitectoService.name);

  constructor(
    @InjectRepository(Arquitecto)
    private readonly arquitectoRepository: Repository<Arquitecto>,
    private readonly rabbitMQService: RabbitMQService,
    private readonly webhookService: WebhookService,
  ) {}

  /**
   * Crea un nuevo arquitecto y publica evento
   */
  async create(createArquitectoDto: CreateArquitectoDto): Promise<Arquitecto> {
    const arquitecto = this.arquitectoRepository.create(createArquitectoDto);
    const saved = await this.arquitectoRepository.save(arquitecto);
    const correlationId = `arch-${saved.id}-${Date.now()}`;

    // Publicar evento de dominio a RabbitMQ
    await this.rabbitMQService.publishEvent('arquitecto.creado', {
      id: saved.id,
      cedula: saved.cedula,
      usuario_id: saved.usuario_id,
      verificado: saved.verificado,
      timestamp: new Date().toISOString(),
    });

    // Publicar webhook para registro y auditoría (Edge Function Logger)
    try {
      await this.webhookService.publishWebhook(
        'architect.registered',
        {
          architect_id: saved.id,
          cedula: saved.cedula,
          usuario_id: saved.usuario_id,
          verificado: saved.verificado,
          created_at: saved.created_at.toISOString(),
        },
        correlationId,
      );
      this.logger.log(`Webhook architect.registered publicado para arquitecto ${saved.id}`);
    } catch (error) {
      this.logger.error(`Error al publicar webhook architect.registered:`, error);
      // No fallar la creación del arquitecto si el webhook falla
    }

    return saved;
  }

  /**
   * Obtiene todos los arquitectos
   */
  async findAll(): Promise<Arquitecto[]> {
    return this.arquitectoRepository.find();
  }

  /**
   * Obtiene un arquitecto por ID
   */
  async findOne(id: string): Promise<Arquitecto> {
    const arquitecto = await this.arquitectoRepository.findOne({
      where: { id },
    });

    if (!arquitecto) {
      throw new NotFoundException(`Arquitecto con ID ${id} no encontrado`);
    }

    return arquitecto;
  }

  /**
   * Actualiza un arquitecto y publica evento si cambia el estado de verificación
   */
  async update(id: string, updateArquitectoDto: UpdateArquitectoDto): Promise<Arquitecto> {
    const arquitecto = await this.findOne(id);
    const verificadoAnterior = arquitecto.verificado;

    Object.assign(arquitecto, updateArquitectoDto);
    const updated = await this.arquitectoRepository.save(arquitecto);

    // Si cambió el estado de verificación, publicar evento
    if (updateArquitectoDto.verificado !== undefined && updateArquitectoDto.verificado !== verificadoAnterior) {
      await this.rabbitMQService.publishEvent('arquitecto.verificado', {
        id: updated.id,
        verificado: updated.verificado,
        timestamp: new Date().toISOString(),
      });
    } else if (Object.keys(updateArquitectoDto).length > 0) {
      await this.rabbitMQService.publishEvent('arquitecto.actualizado', {
        id: updated.id,
        cambios: updateArquitectoDto,
        timestamp: new Date().toISOString(),
      });
    }

    return updated;
  }

  /**
   * Marca un arquitecto como verificado (usado por eventos de verificación)
   */
  async marcarComoVerificado(arquitectoId: string): Promise<void> {
    const arquitecto = await this.findOne(arquitectoId);
    arquitecto.verificado = true;
    await this.arquitectoRepository.save(arquitecto);

    await this.rabbitMQService.publishEvent('arquitecto.verificado', {
      id: arquitecto.id,
      verificado: true,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Verifica si un arquitecto existe
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.arquitectoRepository.count({ where: { id } });
    return count > 0;
  }
}


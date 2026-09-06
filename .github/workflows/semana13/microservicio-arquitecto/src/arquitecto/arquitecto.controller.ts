import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArquitectoService } from './arquitecto.service';
import { CreateArquitectoDto } from './dto/create-arquitecto.dto';
import { UpdateArquitectoDto } from './dto/update-arquitecto.dto';
import { MessagePattern, EventPattern } from '@nestjs/microservices';

/**
 * Controlador de Arquitecto
 * Expone endpoints para comunicación vía RabbitMQ
 */
@Controller()
export class ArquitectoController {
  constructor(private readonly arquitectoService: ArquitectoService) {}

  /**
   * Endpoint para crear arquitecto vía RabbitMQ
   */
  @MessagePattern('arquitecto.create')
  async create(@Body() createArquitectoDto: CreateArquitectoDto) {
    return this.arquitectoService.create(createArquitectoDto);
  }

  /**
   * Endpoint para obtener todos los arquitectos vía RabbitMQ
   */
  @MessagePattern('arquitecto.findAll')
  async findAll() {
    return this.arquitectoService.findAll();
  }

  /**
   * Endpoint para obtener un arquitecto por ID vía RabbitMQ
   */
  @MessagePattern('arquitecto.findOne')
  async findOne(@Body() data: { id: string }) {
    return this.arquitectoService.findOne(data.id);
  }

  /**
   * Endpoint para actualizar arquitecto vía RabbitMQ
   */
  @MessagePattern('arquitecto.update')
  async update(@Body() data: { id: string; updateDto: UpdateArquitectoDto }) {
    return this.arquitectoService.update(data.id, data.updateDto);
  }

  /**
   * Escucha eventos de verificación completada
   */
  @EventPattern('verificacion.completada')
  async handleVerificacionCompletada(@Body() data: { arquitecto_id: string; estado: string }) {
    if (data.estado === 'verificado') {
      await this.arquitectoService.marcarComoVerificado(data.arquitecto_id);
    }
  }

  /**
   * Verifica existencia de arquitecto (usado por microservicio de verificación)
   */
  @MessagePattern('arquitecto.exists')
  async exists(@Body() data: { id: string }) {
    return { exists: await this.arquitectoService.exists(data.id) };
  }
}


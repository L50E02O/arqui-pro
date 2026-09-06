import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateArquitectoDto } from './dto/create-arquitecto.dto';
import { UpdateArquitectoDto } from './dto/update-arquitecto.dto';

/**
 * Controlador REST de Arquitecto
 * Expone endpoints HTTP que enrutan a través de RabbitMQ al microservicio
 */
@Controller('arquitectos')
export class ArquitectoController {
  constructor(
    @Inject('ARQUITECTO_SERVICE') private readonly client: ClientProxy,
  ) {}

  /**
   * GET /arquitectos
   * Lista todos los arquitectos
   */
  @Get()
  async findAll() {
    try {
      return await firstValueFrom(this.client.send('arquitecto.findAll', {}));
    } catch (error) {
      throw new HttpException(
        'Error al obtener arquitectos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /arquitectos/:id
   * Obtiene un arquitecto por ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await firstValueFrom(this.client.send('arquitecto.findOne', { id }));
    } catch (error) {
      if (error.message?.includes('no encontrado')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Error al obtener arquitecto',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /arquitectos
   * Crea un nuevo arquitecto
   */
  @Post()
  async create(@Body() createArquitectoDto: CreateArquitectoDto) {
    try {
      return await firstValueFrom(
        this.client.send('arquitecto.create', createArquitectoDto),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al crear arquitecto',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * PATCH /arquitectos/:id
   * Actualiza un arquitecto existente
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateArquitectoDto: UpdateArquitectoDto,
  ) {
    try {
      return await firstValueFrom(
        this.client.send('arquitecto.update', { id, updateDto: updateArquitectoDto }),
      );
    } catch (error) {
      if (error.message?.includes('no encontrado')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.message || 'Error al actualizar arquitecto',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}


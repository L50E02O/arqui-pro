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
import { CreateVerificacionDto } from './dto/create-verificacion.dto';
import { UpdateVerificacionDto } from './dto/update-verificacion.dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Controlador REST de Verificación
 * Expone endpoints HTTP que enrutan a través de RabbitMQ al microservicio
 * Genera claves de idempotencia automáticamente si no se proporcionan
 */
@Controller('verificaciones')
export class VerificacionController {
  constructor(
    @Inject('VERIFICACION_SERVICE') private readonly client: ClientProxy,
  ) {}

  /**
   * GET /verificaciones
   * Lista todas las verificaciones
   */
  @Get()
  async findAll() {
    try {
      return await firstValueFrom(this.client.send('verificacion.findAll', {}));
    } catch (error) {
      throw new HttpException(
        'Error al obtener verificaciones',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /verificaciones/:id
   * Obtiene una verificación por ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await firstValueFrom(this.client.send('verificacion.findOne', { id }));
    } catch (error) {
      if (error.message?.includes('no encontrada')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Error al obtener verificación',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /verificaciones
   * Crea una nueva verificación
   * Genera automáticamente una clave de idempotencia si no se proporciona
   */
  @Post()
  async create(@Body() createVerificacionDto: CreateVerificacionDto) {
    try {
      // Generar clave de idempotencia si no se proporciona
      if (!createVerificacionDto.idempotency_key) {
        createVerificacionDto.idempotency_key = uuidv4();
      }

      return await firstValueFrom(
        this.client.send('verificacion.create', createVerificacionDto),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al crear verificación',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * PATCH /verificaciones/:id
   * Actualiza una verificación existente
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVerificacionDto: UpdateVerificacionDto,
  ) {
    try {
      // Generar clave de idempotencia si no se proporciona
      if (!updateVerificacionDto.idempotency_key) {
        updateVerificacionDto.idempotency_key = uuidv4();
      }

      return await firstValueFrom(
        this.client.send('verificacion.update', { id, updateDto: updateVerificacionDto }),
      );
    } catch (error) {
      if (error.message?.includes('no encontrada')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.message || 'Error al actualizar verificación',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}


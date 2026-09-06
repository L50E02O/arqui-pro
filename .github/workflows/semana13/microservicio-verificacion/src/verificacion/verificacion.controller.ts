import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { VerificacionService } from './verificacion.service';
import { CreateVerificacionDto } from './dto/create-verificacion.dto';
import { UpdateVerificacionDto } from './dto/update-verificacion.dto';
import { MessagePattern, EventPattern } from '@nestjs/microservices';

/**
 * Controlador de Verificación
 * Expone endpoints HTTP y para comunicación vía RabbitMQ
 */
@Controller('api/verificacion')
export class VerificacionController {
  constructor(private readonly verificacionService: VerificacionService) {}

  // =====================================================
  // ENDPOINTS HTTP (para MCP Server y API Gateway)
  // =====================================================

  /**
   * GET /api/verificacion/buscar
   * Busca verificaciones por criterios
   */
  @Get('buscar')
  async buscar(
    @Query('id') id?: string,
    @Query('arquitectoId') arquitectoId?: string,
    @Query('estado') estado?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.verificacionService.buscar({
      id,
      arquitectoId,
      estado,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  /**
   * GET /api/verificacion/:id
   * Obtiene una verificación por ID
   */
  @Get(':id')
  async findOneHttp(@Param('id') id: string) {
    return this.verificacionService.findOne(id);
  }

  /**
   * POST /api/verificacion
   * Crea una nueva verificación
   */
  @Post()
  async createHttp(@Body() createDto: CreateVerificacionDto) {
    return this.verificacionService.create(createDto);
  }

  /**
   * PATCH /api/verificacion/:id
   * Actualiza una verificación
   */
  @Patch(':id')
  async updateHttp(
    @Param('id') id: string,
    @Body() updateDto: UpdateVerificacionDto,
  ) {
    return this.verificacionService.update(id, updateDto);
  }

  // =====================================================
  // ENDPOINTS RABBITMQ (existentes)
  // =====================================================

  /**
   * Endpoint para crear verificación vía RabbitMQ
   */
  @MessagePattern('verificacion.create')
  async create(@Body() createVerificacionDto: CreateVerificacionDto) {
    return this.verificacionService.create(createVerificacionDto);
  }

  /**
   * Endpoint para obtener todas las verificaciones vía RabbitMQ
   */
  @MessagePattern('verificacion.findAll')
  async findAll() {
    return this.verificacionService.findAll();
  }

  /**
   * Endpoint para obtener una verificación por ID vía RabbitMQ
   */
  @MessagePattern('verificacion.findOne')
  async findOne(@Body() data: { id: string }) {
    return this.verificacionService.findOne(data.id);
  }

  /**
   * Endpoint para actualizar verificación vía RabbitMQ
   */
  @MessagePattern('verificacion.update')
  async update(@Body() data: { id: string; updateDto: UpdateVerificacionDto }) {
    return this.verificacionService.update(data.id, data.updateDto);
  }

  /**
   * Endpoint para obtener verificación por arquitecto vía RabbitMQ
   */
  @MessagePattern('verificacion.findByArquitecto')
  async findByArquitecto(@Body() data: { arquitecto_id: string }) {
    return this.verificacionService.findByArquitecto(data.arquitecto_id);
  }

  // Nota: El evento 'arquitecto.creado' se maneja en EventListenerService
  // usando amqplib directamente para mayor control sobre el consumo de eventos
  // Los eventos asíncronos NO usan @MessagePattern, se manejan con amqplib
}


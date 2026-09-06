import { IsOptional, IsBoolean, IsNumber, IsString } from 'class-validator';

/**
 * DTO para actualizar un arquitecto existente
 */
export class UpdateArquitectoDto {
  @IsString()
  @IsOptional()
  cedula?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  especialidades?: string;

  @IsString()
  @IsOptional()
  ubicacion?: string;

  @IsBoolean()
  @IsOptional()
  verificado?: boolean;

  @IsNumber()
  @IsOptional()
  valoracion_prom_proyecto?: number;

  @IsNumber()
  @IsOptional()
  vistas_perfil?: number;
}


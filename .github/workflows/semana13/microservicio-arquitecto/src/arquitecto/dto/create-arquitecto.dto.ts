import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean } from 'class-validator';

/**
 * DTO para crear un nuevo arquitecto
 */
export class CreateArquitectoDto {
  @IsString()
  @IsNotEmpty()
  cedula: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  especialidades: string;

  @IsString()
  @IsNotEmpty()
  ubicacion: string;

  @IsUUID()
  @IsNotEmpty()
  usuario_id: string;

  @IsBoolean()
  @IsOptional()
  verificado?: boolean;
}
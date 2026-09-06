import { IsString, IsNotEmpty, IsUUID, IsIn, IsOptional } from 'class-validator';

/**
 * DTO para crear una nueva verificación
 */
export class CreateVerificacionDto {
  @IsUUID()
  @IsNotEmpty()
  arquitecto_id: string;

  @IsUUID()
  @IsNotEmpty()
  moderador_id: string;

  @IsString()
  @IsIn(['pendiente', 'verificado', 'rechazado'])
  @IsNotEmpty()
  estado: 'pendiente' | 'verificado' | 'rechazado';

  @IsString()
  @IsOptional()
  idempotency_key?: string; // Clave de idempotencia (opcional, se genera automáticamente)
}


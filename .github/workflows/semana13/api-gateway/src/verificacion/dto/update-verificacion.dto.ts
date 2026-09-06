import { IsString, IsOptional, IsIn } from 'class-validator';

/**
 * DTO para actualizar una verificación existente
 */
export class UpdateVerificacionDto {
  @IsString()
  @IsIn(['pendiente', 'verificado', 'rechazado'])
  @IsOptional()
  estado?: 'pendiente' | 'verificado' | 'rechazado';

  @IsString()
  @IsOptional()
  idempotency_key?: string; // Clave de idempotencia (opcional, se genera automáticamente)
}


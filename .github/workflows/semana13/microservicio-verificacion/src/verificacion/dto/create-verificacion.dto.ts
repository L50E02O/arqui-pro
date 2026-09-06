import { IsString, IsNotEmpty, IsUUID, IsIn } from 'class-validator';

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
  @IsNotEmpty()
  idempotency_key: string; // Clave de idempotencia para evitar duplicados
}


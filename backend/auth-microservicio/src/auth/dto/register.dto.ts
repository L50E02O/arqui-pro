import {
    IsString,
    IsNotEmpty,
    IsEmail,
    MinLength,
    IsEnum,
    IsOptional,
} from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    apellido: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @IsEnum(['cliente', 'arquitecto', 'moderador'], {
        message: 'El rol debe ser cliente, arquitecto o moderador',
    })
    rol: string;

    @IsOptional()
    @IsString()
    foto_perfil?: string;

    @IsOptional()
    arquitecto_attributes?: any;

    @IsOptional()
    cliente_attributes?: any;

    @IsOptional()
    moderador_attributes?: any;
}

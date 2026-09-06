import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';

@Entity('usuario')
export class Usuario {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    nombre: string;

    @Column({ type: 'varchar', length: 255 })
    apellido: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 50, default: 'activo' })
    estado_cuenta: string; // 'suspendido' | 'activo'

    @Column({ type: 'varchar', length: 255 })
    encrypted_password: string;

    @Column({ type: 'varchar', length: 50 })
    rol: string; // 'cliente' | 'arquitecto' | 'moderador'

    @CreateDateColumn({ type: 'date' })
    fecha_registro: Date;

    @Column({ type: 'varchar', length: 500, nullable: true })
    foto_perfil: string;

    @OneToMany(() => RefreshToken, (token) => token.usuario)
    refreshTokens: RefreshToken[];
}

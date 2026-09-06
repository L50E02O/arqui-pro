import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('refresh_token')
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    token: string;

    @ManyToOne(() => Usuario, (usuario) => usuario.refreshTokens, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @Column({ type: 'uuid' })
    usuario_id: string;

    @Column({ type: 'timestamp' })
    expiracion: Date;

    @CreateDateColumn({ type: 'timestamp' })
    creado_en: Date;

    @Column({ type: 'boolean', default: false })
    revocado: boolean;
}

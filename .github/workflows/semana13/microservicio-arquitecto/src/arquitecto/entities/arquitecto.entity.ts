import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Entidad Arquitecto - Entidad Maestra
 * Representa un arquitecto en el sistema
 */
@Entity('arquitectos')
export class Arquitecto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  cedula: string;

  @Column({ type: 'float', default: 0.0 })
  valoracion_prom_proyecto: number;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'varchar', length: 255 })
  especialidades: string;

  @Column({ type: 'varchar', length: 255 })
  ubicacion: string;

  @Column({ type: 'boolean', default: false })
  verificado: boolean;

  @Column({ type: 'int', default: 0 })
  vistas_perfil: number;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuario_id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}


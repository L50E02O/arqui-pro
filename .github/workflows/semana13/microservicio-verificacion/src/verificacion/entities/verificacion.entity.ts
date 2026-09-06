import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Entidad Verificación - Entidad Transaccional
 * Representa una verificación de un arquitecto
 */
@Entity('verificaciones')
export class Verificacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pendiente',
  })
  estado: 'pendiente' | 'verificado' | 'rechazado';

  @Column({ type: 'timestamp', name: 'fecha_verificacion', default: () => 'CURRENT_TIMESTAMP' })
  fecha_verificacion: Date;

  @Column({ type: 'uuid', name: 'arquitecto_id' })
  arquitecto_id: string;

  @Column({ type: 'uuid', name: 'moderador_id' })
  moderador_id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}


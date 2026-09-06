import { MigrationInterface, QueryRunner, Table, Check } from 'typeorm';

/**
 * Migración para crear la tabla de verificaciones
 */
export class CreateVerificaciones1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'verificaciones',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'estado',
            type: 'varchar',
            length: '20',
            default: "'pendiente'",
            isNullable: false,
          },
          {
            name: 'fecha_verificacion',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'arquitecto_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'moderador_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_verificaciones_arquitecto_id',
            columnNames: ['arquitecto_id'],
            isUnique: true,
          },
          {
            name: 'IDX_verificaciones_moderador_id',
            columnNames: ['moderador_id'],
          },
        ],
        checks: [
          {
            name: 'CHK_verificaciones_estado',
            expression: "estado IN ('pendiente', 'verificado', 'rechazado')",
          },
        ],
      }),
      true,
    );

    // Crear trigger para actualizar updated_at automáticamente
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_verificaciones_updated_at
      BEFORE UPDATE ON verificaciones
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('verificaciones');
  }
}


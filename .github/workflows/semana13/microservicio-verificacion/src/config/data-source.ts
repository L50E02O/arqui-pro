import { DataSource } from 'typeorm';
import { Verificacion } from '../verificacion/entities/verificacion.entity';

/**
 * Configuración de TypeORM para migraciones
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5434'),
  username: process.env.DB_USERNAME || 'verificacion_user',
  password: process.env.DB_PASSWORD || 'verificacion_pass',
  database: process.env.DB_DATABASE || 'verificacion_db',
  entities: [Verificacion],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});


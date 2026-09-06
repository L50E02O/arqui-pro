import { DataSource } from 'typeorm';
import { Arquitecto } from '../arquitecto/entities/arquitecto.entity';

/**
 * Configuración de TypeORM para migraciones
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  username: process.env.DB_USERNAME || 'arquitecto_user',
  password: process.env.DB_PASSWORD || 'arquitecto_pass',
  database: process.env.DB_DATABASE || 'arquitecto_db',
  entities: [Arquitecto],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});


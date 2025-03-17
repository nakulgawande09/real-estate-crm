import path from 'path';
import { DatabaseConfig } from './interfaces/BaseRepository';

export function loadDatabaseConfig(): DatabaseConfig {
  const dbType = process.env.DATABASE_TYPE as DatabaseConfig['type'] || 'file';
  const config: DatabaseConfig = { type: dbType };

  switch (dbType) {
    case 'file':
      config.filePath = process.env.DATABASE_FILE_PATH || path.join(process.cwd(), 'data');
      break;
    case 'mongodb':
      config.url = process.env.MONGODB_URL;
      if (!config.url) {
        throw new Error('MONGODB_URL environment variable is required when using MongoDB');
      }
      break;
    case 'postgres':
      config.url = process.env.POSTGRES_URL;
      if (!config.url) {
        throw new Error('POSTGRES_URL environment variable is required when using PostgreSQL');
      }
      break;
    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }

  return config;
} 
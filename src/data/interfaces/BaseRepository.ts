export interface BaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(options?: { page?: number; limit?: number }): Promise<{ data: T[]; total: number }>;
  create(data: Omit<T, '_id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface DatabaseConfig {
  type: 'mongodb' | 'file' | 'postgres';
  url?: string;
  filePath?: string;
} 
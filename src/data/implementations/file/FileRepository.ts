import fs from 'fs/promises';
import path from 'path';
import { BaseRepository } from '../../interfaces/BaseRepository';
import { BaseEntity } from '../../interfaces/entities';

export class FileRepository<T extends BaseEntity> implements BaseRepository<T> {
  private filePath: string;
  private data: Map<string, T> = new Map();
  private initialized = false;

  constructor(entityName: string, basePath: string) {
    this.filePath = path.join(basePath, `${entityName}.json`);
  }

  private async initialize() {
    if (this.initialized) return;

    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      const fileContent = await fs.readFile(this.filePath, 'utf-8');
      const items = JSON.parse(fileContent) as T[];
      items.forEach(item => this.data.set(item._id, item));
    } catch (error) {
      // If file doesn't exist, create it with empty array
      await fs.writeFile(this.filePath, '[]');
    }

    this.initialized = true;
  }

  private async saveToFile() {
    const items = Array.from(this.data.values());
    await fs.writeFile(this.filePath, JSON.stringify(items, null, 2));
  }

  async findById(id: string): Promise<T | null> {
    await this.initialize();
    return this.data.get(id) || null;
  }

  async findAll(options?: { page?: number; limit?: number }): Promise<{ data: T[]; total: number }> {
    await this.initialize();
    let items = Array.from(this.data.values());

    const total = items.length;
    if (options?.page && options?.limit) {
      const start = (options.page - 1) * options.limit;
      const end = start + options.limit;
      items = items.slice(start, end);
    }

    return { data: items, total };
  }

  async create(data: Omit<T, '_id'>): Promise<T> {
    await this.initialize();
    const newItem = {
      ...data,
      _id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as T;

    this.data.set(newItem._id, newItem);
    await this.saveToFile();
    return newItem;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    await this.initialize();
    const existingItem = this.data.get(id);
    if (!existingItem) return null;

    const updatedItem = {
      ...existingItem,
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.data.set(id, updatedItem);
    await this.saveToFile();
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    await this.initialize();
    const deleted = this.data.delete(id);
    if (deleted) {
      await this.saveToFile();
    }
    return deleted;
  }
} 
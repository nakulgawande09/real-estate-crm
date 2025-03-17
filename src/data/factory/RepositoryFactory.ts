import { DatabaseConfig } from '../interfaces/BaseRepository';
import * as FileRepositories from '../implementations/file/repositories';
// We'll add MongoDB and PostgreSQL implementations later
// import * as MongoRepositories from '../implementations/mongodb/repositories';
// import * as PostgresRepositories from '../implementations/postgres/repositories';

export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private config: DatabaseConfig;

  private constructor(config: DatabaseConfig) {
    this.config = config;
  }

  static initialize(config: DatabaseConfig): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory(config);
    }
    return RepositoryFactory.instance;
  }

  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      throw new Error('RepositoryFactory not initialized. Call initialize() first.');
    }
    return RepositoryFactory.instance;
  }

  private getImplementation() {
    switch (this.config.type) {
      case 'file':
        if (!this.config.filePath) {
          throw new Error('File path not configured for file-based storage');
        }
        return FileRepositories;
      case 'mongodb':
        // return MongoRepositories;
        throw new Error('MongoDB implementation not available yet');
      case 'postgres':
        // return PostgresRepositories;
        throw new Error('PostgreSQL implementation not available yet');
      default:
        throw new Error(`Unknown database type: ${this.config.type}`);
    }
  }

  createProjectRepository() {
    const impl = this.getImplementation();
    return new impl.ProjectRepository(this.config.filePath!);
  }

  createUserRepository() {
    const impl = this.getImplementation();
    return new impl.UserRepository(this.config.filePath!);
  }

  createDocumentRepository() {
    const impl = this.getImplementation();
    return new impl.DocumentRepository(this.config.filePath!);
  }

  createLoanRepository() {
    const impl = this.getImplementation();
    return new impl.LoanRepository(this.config.filePath!);
  }

  createInvestorRepository() {
    const impl = this.getImplementation();
    return new impl.InvestorRepository(this.config.filePath!);
  }

  createInvestmentRepository() {
    const impl = this.getImplementation();
    return new impl.InvestmentRepository(this.config.filePath!);
  }

  createTransactionRepository() {
    const impl = this.getImplementation();
    return new impl.TransactionRepository(this.config.filePath!);
  }
} 
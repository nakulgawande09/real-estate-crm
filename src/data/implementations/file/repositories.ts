import { FileRepository } from './FileRepository';
import {
  Project,
  User,
  Document,
  Loan,
  Investor,
  Investment,
  Transaction
} from '../../interfaces/entities';

export class ProjectRepository extends FileRepository<Project> {
  constructor(basePath: string) {
    super('projects', basePath);
  }
}

export class UserRepository extends FileRepository<User> {
  constructor(basePath: string) {
    super('users', basePath);
  }
}

export class DocumentRepository extends FileRepository<Document> {
  constructor(basePath: string) {
    super('documents', basePath);
  }
}

export class LoanRepository extends FileRepository<Loan> {
  constructor(basePath: string) {
    super('loans', basePath);
  }
}

export class InvestorRepository extends FileRepository<Investor> {
  constructor(basePath: string) {
    super('investors', basePath);
  }
}

export class InvestmentRepository extends FileRepository<Investment> {
  constructor(basePath: string) {
    super('investments', basePath);
  }
}

export class TransactionRepository extends FileRepository<Transaction> {
  constructor(basePath: string) {
    super('transactions', basePath);
  }
} 
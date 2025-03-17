// User related enums
export enum UserRole {
  ADMIN = 'ADMIN',
  CEO = 'CEO',
  AGENT = 'AGENT',
  SUPPORT_STAFF = 'SUPPORT_STAFF',
  CLIENT = 'client'
}

// Project related enums
export enum PropertyType {
  SINGLE_FAMILY = 'SINGLE_FAMILY',
  MULTI_FAMILY = 'MULTI_FAMILY',
  COMMERCIAL = 'COMMERCIAL',
  RETAIL = 'RETAIL',
  INDUSTRIAL = 'INDUSTRIAL',
  OFFICE = 'OFFICE',
  MIXED_USE = 'MIXED_USE',
  LAND = 'LAND',
  OTHER = 'OTHER'
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACQUISITION = 'ACQUISITION',
  PRE_DEVELOPMENT = 'PRE_DEVELOPMENT',
  DEVELOPMENT = 'DEVELOPMENT',
  CONSTRUCTION = 'CONSTRUCTION',
  STABILIZATION = 'STABILIZATION',
  HOLDING = 'HOLDING',
  DISPOSITION = 'DISPOSITION',
  CLOSED = 'CLOSED'
}

export enum DocumentType {
  CONTRACT = 'contract',
  PERMIT = 'permit',
  PLAN = 'plan',
  REPORT = 'report',
  OTHER = 'other'
}

// Transaction related enums
export enum TransactionType {
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
  DIVIDEND = 'DIVIDEND',
  PRINCIPAL_PAYMENT = 'PRINCIPAL_PAYMENT',
  INTEREST_PAYMENT = 'INTEREST_PAYMENT',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  TAX = 'TAX',
  OTHER = 'OTHER'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CASH = 'cash',
  CHECK = 'check',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  WIRE_TRANSFER = 'wire_transfer',
  OTHER = 'other'
}

export enum PaymentFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  CUSTOM = 'custom'
}

// Client related enums
export enum ClientType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
  INVESTOR = 'investor',
  PARTNER = 'partner'
}

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LEAD = 'lead',
  FORMER = 'former'
}

export enum ClientSource {
  REFERRAL = 'referral',
  WEBSITE = 'website',
  ADVERTISEMENT = 'advertisement',
  EVENT = 'event',
  COLD_CALL = 'cold_call',
  OTHER = 'other'
}

export enum ClientDocumentType {
  AGREEMENT = 'agreement',
  ID = 'id',
  FINANCIAL = 'financial',
  OTHER = 'other'
}

export enum InteractionType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  VIEWING = 'viewing',
  OTHER = 'other'
}

// Financial-related enums
export enum LoanType {
  MORTGAGE = 'MORTGAGE',
  CONSTRUCTION = 'CONSTRUCTION',
  BRIDGE = 'BRIDGE',
  HARD_MONEY = 'HARD_MONEY',
  PRIVATE = 'PRIVATE',
  LINE_OF_CREDIT = 'LINE_OF_CREDIT',
  OTHER = 'OTHER'
}

export enum RepaymentFrequency {
  MONTHLY = 'MONTHLY',
  BI_WEEKLY = 'BI_WEEKLY',
  WEEKLY = 'WEEKLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUALLY = 'SEMI_ANNUALLY', 
  ANNUALLY = 'ANNUALLY',
  BULLET = 'BULLET' // One-time payment at the end of the term
}

export enum InvestmentType {
  EQUITY = 'EQUITY',
  DEBT = 'DEBT',
  PREFERRED_EQUITY = 'PREFERRED_EQUITY',
  JOINT_VENTURE = 'JOINT_VENTURE',
  SYNDICATION = 'SYNDICATION',
  OTHER = 'OTHER'
}

export enum InvestorType {
  INDIVIDUAL = 'INDIVIDUAL',
  INSTITUTION = 'INSTITUTION',
  CORPORATION = 'CORPORATION',
  PARTNERSHIP = 'PARTNERSHIP',
  TRUST = 'TRUST',
  FAMILY_OFFICE = 'FAMILY_OFFICE',
  OTHER = 'OTHER'
}

export enum TransactionCategory {
  ACQUISITION = 'ACQUISITION',
  CONSTRUCTION = 'CONSTRUCTION',
  RENOVATION = 'RENOVATION',
  MAINTENANCE = 'MAINTENANCE',
  UTILITIES = 'UTILITIES',
  INSURANCE = 'INSURANCE',
  TAXES = 'TAXES',
  MARKETING = 'MARKETING',
  LEGAL = 'LEGAL',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  RENTAL_INCOME = 'RENTAL_INCOME',
  SALE_PROCEEDS = 'SALE_PROCEEDS',
  INVESTMENT = 'INVESTMENT',
  LOAN_PAYMENT = 'LOAN_PAYMENT',
  DIVIDEND = 'DIVIDEND',
  COMMISSION = 'COMMISSION',
  OTHER = 'OTHER'
} 
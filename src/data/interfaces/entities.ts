export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project extends BaseEntity {
  name: string;
  description: string;
  status: string;
  propertyType: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  acquisitionDate: string;
  totalBudget: number;
  financialSummary: {
    totalInvestments: number;
    totalLoans: number;
    totalExpenses: number;
    totalRevenue: number;
    netIncome: number;
    roi: number;
  };
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: string;
  password?: string;
}

export interface Document extends BaseEntity {
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  projectId: string;
  lastUpdatedBy: string;
}

export interface Loan extends BaseEntity {
  projectId: string;
  lenderName: string;
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  endDate: string;
  paymentFrequency: 'monthly' | 'quarterly' | 'annually';
  paymentAmount: number;
  totalInterest: number;
  status: 'active' | 'paid' | 'defaulted' | 'pending';
}

export interface Investor extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  type: 'individual' | 'company' | 'institution';
}

export interface Investment extends BaseEntity {
  projectId: string;
  investorId: string;
  amount: number;
  equityPercentage: number;
  investmentDate: string;
  expectedROI: number;
  status: 'active' | 'exited' | 'pending';
  distributions: Array<{
    date: string;
    amount: number;
    type: 'dividend' | 'capital_return' | 'profit_share';
  }>;
}

export interface Transaction extends BaseEntity {
  projectId: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  relatedEntityType?: 'loan' | 'investment' | 'operation';
  relatedEntityId?: string;
} 
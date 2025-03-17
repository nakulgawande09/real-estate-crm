// Mock data repository for development without MongoDB
import { NextResponse } from 'next/server';
import { ProjectStatus, PropertyType, UserRole } from '@/lib/enums';

// Define mock data types
export interface MockDocument {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  projectId: string;
  createdAt: string;
  lastUpdated: string;
  lastUpdatedBy: string;
}

// Financial Models
export interface MockLoan {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface MockInvestor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  type: 'individual' | 'company' | 'institution';
  createdAt: string;
}

export interface MockInvestment {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface MockTransaction {
  _id: string;
  projectId: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  relatedEntityType?: 'loan' | 'investment' | 'operation';
  relatedEntityId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockProject {
  _id: string;
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
  acquisitionDate?: string;
  startDate?: string;
  totalBudget: number;
  createdAt: string;
  updatedAt: string;
  financialSummary: {
    totalInvestments: number;
    totalLoans: number;
    totalExpenses: number;
    totalRevenue: number;
    netIncome: number;
    roi: number;
  };
}

export interface MockUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Property related interfaces
export interface MockProperty {
  _id: string;
  projectId: string;
  name: string;
  type: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'UNDER_CONTRACT';
  details: {
    bedrooms?: number;
    bathrooms?: number;
    squareFeet: number;
    unitNumber?: string;
    floor?: number;
    features: string[];
    parkingSpaces?: number;
  };
  pricing: {
    listPrice: number;
    soldPrice?: number;
    pricePerSqFt: number;
  };
  media: {
    images: string[];
    virtualTour?: string;
    floorPlan?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MockCustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MockPropertyTransaction {
  _id: string;
  propertyId: string;
  customerId: string;
  type: 'SALE' | 'RESERVATION' | 'CANCELLATION';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  amount: number;
  date: string;
  details: {
    contractNumber?: string;
    paymentMethod: string;
    downPayment?: number;
    mortgageDetails?: {
      lender: string;
      amount: number;
      term: number;
      interestRate: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// Mock projects data
export const mockProjects: MockProject[] = [
  {
    _id: '1',
    name: 'Riverfront Heights',
    description: 'A luxury condominium development with river views in downtown area',
    status: 'DEVELOPMENT',
    propertyType: 'MULTI_FAMILY',
    location: {
      address: '123 River St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA'
    },
    startDate: '2023-03-15',
    totalBudget: 12500000,
    createdAt: '2023-03-01T00:00:00.000Z',
    updatedAt: '2023-03-15T00:00:00.000Z',
    financialSummary: {
      totalInvestments: 7500000,
      totalLoans: 5000000,
      totalExpenses: 5750000,
      totalRevenue: 350000,
      netIncome: -5400000,
      roi: 24.5
    }
  },
  {
    _id: '2',
    name: 'Oakwood Estates',
    description: 'Single-family home community with 25 luxury properties',
    status: 'PLANNING',
    propertyType: 'SINGLE_FAMILY',
    location: {
      address: '500 Oak Ridge Dr',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      country: 'USA'
    },
    acquisitionDate: '2023-05-10',
    totalBudget: 8750000,
    createdAt: '2023-05-01T00:00:00.000Z',
    updatedAt: '2023-05-10T00:00:00.000Z',
    financialSummary: {
      totalInvestments: 3500000,
      totalLoans: 5250000,
      totalExpenses: 2250000,
      totalRevenue: 0,
      netIncome: -2250000,
      roi: 22.0
    }
  },
  {
    _id: '3',
    name: 'Skyline Tower',
    description: 'Mixed-use high-rise with retail, office and residential spaces',
    status: 'PRE_DEVELOPMENT',
    startDate: '2023-07-20',
    endDate: '2026-08-15',
    propertyType: 'MIXED_USE',
    location: {
      address: '789 Downtown Blvd',
      city: 'Houston',
      state: 'TX',
      zipCode: '77002',
      country: 'USA'
    },
    budget: 45000000,
    teamMembers: ['5', '6', '7'],
    financialSummary: {
      totalIncome: 0,
      totalExpenses: 5500000,
      totalLoans: 30000000,
      totalInvestments: 15000000,
      netCashflow: -5500000,
      roi: 28.5,
      loanToValueRatio: 0.67
    }
  },
  {
    _id: '4',
    name: 'Greenview Business Park',
    description: 'Sustainable commercial office park with LEED certification',
    status: 'PLANNING',
    startDate: '2023-09-05',
    endDate: '2025-12-15',
    propertyType: 'COMMERCIAL',
    location: {
      address: '1250 Innovation Way',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78258',
      country: 'USA'
    },
    budget: 18500000,
    teamMembers: ['8', '9'],
    financialSummary: {
      totalIncome: 0,
      totalExpenses: 1250000,
      totalLoans: 11000000,
      totalInvestments: 7500000,
      netCashflow: -1250000,
      roi: 18.5,
      loanToValueRatio: 0.59
    }
  },
  {
    _id: '5',
    name: 'Brighton Gardens',
    description: 'Senior living community with independent and assisted living facilities',
    status: 'STABILIZATION',
    startDate: '2022-04-20',
    endDate: '2023-08-10',
    propertyType: 'SENIOR_LIVING',
    location: {
      address: '350 Tranquil Lane',
      city: 'Plano',
      state: 'TX',
      zipCode: '75024',
      country: 'USA'
    },
    budget: 22500000,
    teamMembers: ['10', '11', '12'],
    financialSummary: {
      totalIncome: 2500000,
      totalExpenses: 21750000,
      totalLoans: 13500000,
      totalInvestments: 9000000,
      netCashflow: -19250000,
      roi: 16.5,
      loanToValueRatio: 0.6
    }
  },
  {
    _id: '6',
    name: 'Tech Hub Campus',
    description: 'Modern office complex designed for tech companies and startups',
    status: 'CLOSED',
    startDate: '2021-05-15',
    endDate: '2022-12-20',
    propertyType: 'COMMERCIAL',
    location: {
      address: '888 Innovation Drive',
      city: 'Austin',
      state: 'TX',
      zipCode: '78730',
      country: 'USA'
    },
    budget: 32000000,
    teamMembers: ['13', '14'],
    financialSummary: {
      totalIncome: 37500000,
      totalExpenses: 31500000,
      totalLoans: 19200000,
      totalInvestments: 12800000,
      netCashflow: 6000000,
      roi: 25.0,
      loanToValueRatio: 0.6
    }
  },
  {
    _id: '7',
    name: 'Harbor View Industrial Park',
    description: 'State-of-the-art industrial complex with logistics facilities and warehouses',
    status: 'CONSTRUCTION',
    startDate: '2023-11-01',
    endDate: '2025-04-30',
    propertyType: 'INDUSTRIAL',
    location: {
      address: '800 Port Drive',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA'
    },
    budget: 28000000,
    teamMembers: ['13', '14', '15'],
    financialSummary: {
      totalIncome: 0,
      totalExpenses: 8500000,
      totalLoans: 18000000,
      totalInvestments: 10000000,
      netCashflow: -8500000,
      roi: 21.5,
      loanToValueRatio: 0.64
    }
  },
  {
    _id: '8',
    name: 'Sunset Strip Mall',
    description: 'Modern retail complex with premium shopping and dining experiences',
    status: 'ACQUISITION',
    startDate: '2024-01-15',
    endDate: '2025-08-30',
    propertyType: 'RETAIL',
    location: {
      address: '2100 Shopping Avenue',
      city: 'Austin',
      state: 'TX',
      zipCode: '78704',
      country: 'USA'
    },
    budget: 15500000,
    teamMembers: ['16', '17'],
    financialSummary: {
      totalIncome: 0,
      totalExpenses: 1200000,
      totalLoans: 9000000,
      totalInvestments: 6500000,
      netCashflow: -1200000,
      roi: 19.8,
      loanToValueRatio: 0.58
    }
  },
  {
    _id: '9',
    name: 'Innovation Office Tower',
    description: 'Premium office space with smart building technology and sustainable features',
    status: 'DEVELOPMENT',
    startDate: '2023-09-01',
    endDate: '2025-12-15',
    propertyType: 'OFFICE',
    location: {
      address: '450 Tech Boulevard',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75202',
      country: 'USA'
    },
    budget: 32000000,
    teamMembers: ['18', '19', '20'],
    financialSummary: {
      totalIncome: 0,
      totalExpenses: 9500000,
      totalLoans: 20000000,
      totalInvestments: 12000000,
      netCashflow: -9500000,
      roi: 23.5,
      loanToValueRatio: 0.625
    }
  },
  {
    _id: '10',
    name: 'Green Valley Development',
    description: 'Large land development project for future mixed-use community',
    status: 'PLANNING',
    startDate: '2024-03-01',
    endDate: '2026-09-30',
    propertyType: 'LAND',
    location: {
      address: '3000 Valley Road',
      city: 'San Antonio',
      state: 'TX',
      zipCode: '78260',
      country: 'USA'
    },
    budget: 25000000,
    teamMembers: ['21', '22'],
    financialSummary: {
      totalIncome: 0,
      totalExpenses: 2000000,
      totalLoans: 15000000,
      totalInvestments: 10000000,
      netCashflow: -2000000,
      roi: 25.0,
      loanToValueRatio: 0.6
    }
  },
  {
    _id: '11',
    name: 'Urban Living Complex',
    description: 'Modern apartment complex with co-working spaces and community amenities',
    status: 'PRE_DEVELOPMENT',
    startDate: '2024-02-15',
    endDate: '2026-06-30',
    propertyType: 'MULTI_FAMILY',
    location: {
      address: '575 Urban Street',
      city: 'Austin',
      state: 'TX',
      zipCode: '78702',
      country: 'USA'
    },
    budget: 28500000,
    teamMembers: ['23', '24', '25'],
    financialSummary: {
      totalIncome: 0,
      totalExpenses: 3500000,
      totalLoans: 17000000,
      totalInvestments: 11500000,
      netCashflow: -3500000,
      roi: 22.8,
      loanToValueRatio: 0.596
    }
  }
];

// Mock documents data
export const mockDocuments: MockDocument[] = [
  {
    _id: "67d5879b7845951cae8fddee",
    title: "Architectural Blueprints",
    description: "Detailed architectural plans for the main building",
    fileUrl: "https://example.com/blueprints.pdf",
    fileType: "pdf",
    uploadedBy: "67d6b7a80d46273496becd88",
    projectId: "67d5879b7845951cae8fddeb",
    createdAt: "2023-01-20T00:00:00.000Z",
    lastUpdated: "2023-01-20T00:00:00.000Z",
    lastUpdatedBy: "67d6b7a80d46273496becd88"
  },
  {
    _id: "67d5879b7845951cae8fddef",
    title: "Environmental Impact Report",
    description: "Assessment of environmental impacts and mitigation strategies",
    fileUrl: "https://example.com/environmental-report.pdf",
    fileType: "pdf",
    uploadedBy: "67d6b7a80d46273496becd89",
    projectId: "67d5879b7845951cae8fddeb",
    createdAt: "2023-02-05T00:00:00.000Z",
    lastUpdated: "2023-02-10T00:00:00.000Z",
    lastUpdatedBy: "67d6b7a80d46273496becd88"
  },
  {
    _id: "67d5879b7845951cae8fddf0",
    title: "Project Timeline",
    description: "Detailed project schedule with milestones",
    fileUrl: "https://example.com/timeline.xlsx",
    fileType: "xlsx",
    uploadedBy: "67d6b7a80d46273496becd88",
    projectId: "67d5879b7845951cae8fddec",
    createdAt: "2023-03-10T00:00:00.000Z",
    lastUpdated: "2023-03-10T00:00:00.000Z",
    lastUpdatedBy: "67d6b7a80d46273496becd88"
  }
];

// Mock loans data
export const mockLoans: MockLoan[] = [
  {
    _id: "67d5879b7845951cae8fddf1",
    projectId: "67d5879b7845951cae8fddeb",
    lenderName: "First National Bank",
    principalAmount: 25000000,
    interestRate: 4.5,
    termMonths: 240, // 20 years
    startDate: "2023-02-15T00:00:00.000Z",
    endDate: "2043-02-15T00:00:00.000Z",
    paymentFrequency: "monthly",
    paymentAmount: 158200, // Monthly payment
    totalInterest: 13010000, // Total interest over the life of the loan
    status: "active",
    createdAt: "2023-02-10T00:00:00.000Z",
    updatedAt: "2023-02-10T00:00:00.000Z"
  },
  {
    _id: "67d5879b7845951cae8fddf2",
    projectId: "67d5879b7845951cae8fddeb",
    lenderName: "Urban Development Fund",
    principalAmount: 15000000,
    interestRate: 3.8,
    termMonths: 180, // 15 years
    startDate: "2023-03-01T00:00:00.000Z",
    endDate: "2038-03-01T00:00:00.000Z",
    paymentFrequency: "monthly",
    paymentAmount: 109600, // Monthly payment
    totalInterest: 4728000, // Total interest over the life of the loan
    status: "active",
    createdAt: "2023-02-20T00:00:00.000Z",
    updatedAt: "2023-02-20T00:00:00.000Z"
  },
  {
    _id: "67d5879b7845951cae8fddf3",
    projectId: "67d5879b7845951cae8fddec",
    lenderName: "Commercial Property Lenders Inc.",
    principalAmount: 75000000,
    interestRate: 5.2,
    termMonths: 300, // 25 years
    startDate: "2023-04-01T00:00:00.000Z",
    endDate: "2048-04-01T00:00:00.000Z",
    paymentFrequency: "monthly",
    paymentAmount: 447500, // Monthly payment
    totalInterest: 59250000, // Total interest over the life of the loan
    status: "active",
    createdAt: "2023-03-15T00:00:00.000Z",
    updatedAt: "2023-03-15T00:00:00.000Z"
  }
];

// Mock investors data
export const mockInvestors: MockInvestor[] = [
  {
    _id: "67d5879b7845951cae8fddf4",
    name: "Skyline Capital Partners",
    email: "investments@skylinecapital.com",
    phone: "415-555-0100",
    type: "company",
    createdAt: "2023-01-05T00:00:00.000Z"
  },
  {
    _id: "67d5879b7845951cae8fddf5",
    name: "Jennifer Reynolds",
    email: "jennifer.reynolds@gmail.com",
    phone: "312-555-0234",
    type: "individual",
    createdAt: "2023-01-10T00:00:00.000Z"
  },
  {
    _id: "67d5879b7845951cae8fddf6",
    name: "Blackstone Real Estate Fund",
    email: "realestate@blackstone.com",
    phone: "212-555-0789",
    type: "institution",
    createdAt: "2023-01-15T00:00:00.000Z"
  }
];

// Mock investments data
export const mockInvestments: MockInvestment[] = [
  {
    _id: "67d5879b7845951cae8fddf7",
    projectId: "67d5879b7845951cae8fddeb",
    investorId: "67d5879b7845951cae8fddf4",
    amount: 15000000,
    equityPercentage: 20,
    investmentDate: "2023-02-01T00:00:00.000Z",
    expectedROI: 15.5,
    status: "active",
    distributions: [
      {
        date: "2023-08-01T00:00:00.000Z",
        amount: 375000,
        type: "dividend"
      },
      {
        date: "2024-02-01T00:00:00.000Z",
        amount: 425000,
        type: "dividend"
      }
    ],
    createdAt: "2023-01-25T00:00:00.000Z",
    updatedAt: "2024-02-01T00:00:00.000Z"
  },
  {
    _id: "67d5879b7845951cae8fddf8",
    projectId: "67d5879b7845951cae8fddeb",
    investorId: "67d5879b7845951cae8fddf5",
    amount: 10000000,
    equityPercentage: 13.33,
    investmentDate: "2023-02-05T00:00:00.000Z",
    expectedROI: 14.8,
    status: "active",
    distributions: [
      {
        date: "2023-08-01T00:00:00.000Z",
        amount: 250000,
        type: "dividend"
      },
      {
        date: "2024-02-01T00:00:00.000Z",
        amount: 285000,
        type: "dividend"
      }
    ],
    createdAt: "2023-02-01T00:00:00.000Z",
    updatedAt: "2024-02-01T00:00:00.000Z"
  },
  {
    _id: "67d5879b7845951cae8fddf9",
    projectId: "67d5879b7845951cae8fddec",
    investorId: "67d5879b7845951cae8fddf6",
    amount: 45000000,
    equityPercentage: 37.5,
    investmentDate: "2023-03-15T00:00:00.000Z",
    expectedROI: 18.2,
    status: "active",
    distributions: [],
    createdAt: "2023-03-10T00:00:00.000Z",
    updatedAt: "2023-03-10T00:00:00.000Z"
  }
];

// Mock transactions data
export const mockTransactions: MockTransaction[] = [
  // City Center Residential Tower - Income
  {
    _id: "67d5879b7845951cae8fddfa",
    projectId: "67d5879b7845951cae8fddeb",
    amount: 1500000,
    date: "2023-09-15T00:00:00.000Z",
    type: "income",
    category: "pre_sales",
    description: "Deposit payments from pre-sales of 10 units",
    createdAt: "2023-09-15T00:00:00.000Z",
    updatedAt: "2023-09-15T00:00:00.000Z"
  },
  {
    _id: "67d5879b7845951cae8fddfb",
    projectId: "67d5879b7845951cae8fddeb",
    amount: 1000000,
    date: "2024-01-20T00:00:00.000Z",
    type: "income",
    category: "pre_sales",
    description: "Deposit payments from pre-sales of 7 units",
    createdAt: "2024-01-20T00:00:00.000Z",
    updatedAt: "2024-01-20T00:00:00.000Z"
  },
  // City Center Residential Tower - Expenses
  {
    _id: "67d5879b7845951cae8fddfc",
    projectId: "67d5879b7845951cae8fddeb",
    amount: 800000,
    date: "2023-03-10T00:00:00.000Z",
    type: "expense",
    category: "construction",
    description: "Foundation work payment",
    createdAt: "2023-03-10T00:00:00.000Z",
    updatedAt: "2023-03-10T00:00:00.000Z"
  },
  {
    _id: "67d5879b7845951cae8fddfd",
    projectId: "67d5879b7845951cae8fddeb",
    amount: 950000,
    date: "2023-07-05T00:00:00.000Z",
    type: "expense",
    category: "construction",
    description: "Structural steel framing",
    createdAt: "2023-07-05T00:00:00.000Z",
    updatedAt: "2023-07-05T00:00:00.000Z"
  },
  // Riverfront Commercial Plaza - Expenses
  {
    _id: "67d5879b7845951cae8fddfe",
    projectId: "67d5879b7845951cae8fddec",
    amount: 350000,
    date: "2023-04-20T00:00:00.000Z",
    type: "expense",
    category: "planning",
    description: "Architectural design and planning fees",
    createdAt: "2023-04-20T00:00:00.000Z",
    updatedAt: "2023-04-20T00:00:00.000Z"
  },
  // Sunset Hills - Income (completed project)
  {
    _id: "67d5879b7845951cae8fddff",
    projectId: "67d5879b7845951cae8fdded",
    amount: 115000000,
    date: "2023-11-15T00:00:00.000Z",
    type: "income",
    category: "sales",
    description: "Total sales of all 150 residential units",
    createdAt: "2023-11-15T00:00:00.000Z",
    updatedAt: "2023-11-15T00:00:00.000Z"
  },
  // Sunset Hills - Expenses (completed project)
  {
    _id: "67d5879b7845951cae8fde00",
    projectId: "67d5879b7845951cae8fdded",
    amount: 87500000,
    date: "2023-11-10T00:00:00.000Z",
    type: "expense",
    category: "construction",
    description: "Total construction and development expenses",
    createdAt: "2023-11-10T00:00:00.000Z",
    updatedAt: "2023-11-10T00:00:00.000Z"
  }
];

// Mock users data
export const mockUsers: MockUser[] = [
  {
    _id: 'demo-ceo-1',
    name: 'Demo CEO',
    email: 'demo@realestatecrm.com',
    password: 'demo123456',
    role: UserRole.CEO,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock properties data
export const mockProperties: MockProperty[] = [
  {
    _id: 'prop1',
    projectId: '1', // Riverfront Heights
    name: 'Luxury Suite 1201',
    type: 'CONDO',
    status: 'SOLD',
    details: {
      bedrooms: 3,
      bathrooms: 2.5,
      squareFeet: 2200,
      unitNumber: '1201',
      floor: 12,
      features: [
        'River View',
        'Corner Unit',
        'Private Balcony',
        'Smart Home Technology',
        'High-end Appliances'
      ],
      parkingSpaces: 2
    },
    pricing: {
      listPrice: 1250000,
      soldPrice: 1225000,
      pricePerSqFt: 556.82
    },
    media: {
      images: [
        'riverfront-heights-1201-living.jpg',
        'riverfront-heights-1201-kitchen.jpg',
        'riverfront-heights-1201-master.jpg'
      ],
      virtualTour: 'https://example.com/virtual-tours/rh-1201',
      floorPlan: 'https://example.com/floorplans/rh-1201'
    },
    createdAt: '2023-03-15T00:00:00.000Z',
    updatedAt: '2023-07-20T00:00:00.000Z'
  },
  {
    _id: 'prop2',
    projectId: '1', // Riverfront Heights
    name: 'Luxury Suite 1202',
    type: 'CONDO',
    status: 'UNDER_CONTRACT',
    details: {
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1800,
      unitNumber: '1202',
      floor: 12,
      features: [
        'City View',
        'Private Balcony',
        'Smart Home Technology',
        'High-end Appliances'
      ],
      parkingSpaces: 1
    },
    pricing: {
      listPrice: 950000,
      pricePerSqFt: 527.78
    },
    media: {
      images: [
        'riverfront-heights-1202-living.jpg',
        'riverfront-heights-1202-kitchen.jpg'
      ],
      virtualTour: 'https://example.com/virtual-tours/rh-1202',
      floorPlan: 'https://example.com/floorplans/rh-1202'
    },
    createdAt: '2023-03-15T00:00:00.000Z',
    updatedAt: '2023-08-15T00:00:00.000Z'
  },
  {
    _id: 'prop3',
    projectId: '2', // Oakwood Estates
    name: 'Villa 101',
    type: 'SINGLE_FAMILY',
    status: 'AVAILABLE',
    details: {
      bedrooms: 4,
      bathrooms: 3.5,
      squareFeet: 3500,
      features: [
        'Large Backyard',
        'Gourmet Kitchen',
        'Home Theater',
        'Smart Home System',
        'Three-car Garage'
      ],
      parkingSpaces: 3
    },
    pricing: {
      listPrice: 1750000,
      pricePerSqFt: 500
    },
    media: {
      images: [
        'oakwood-101-exterior.jpg',
        'oakwood-101-interior.jpg',
        'oakwood-101-backyard.jpg'
      ],
      virtualTour: 'https://example.com/virtual-tours/oe-101',
      floorPlan: 'https://example.com/floorplans/oe-101'
    },
    createdAt: '2023-05-10T00:00:00.000Z',
    updatedAt: '2023-05-10T00:00:00.000Z'
  }
];

// Mock customers data
export const mockCustomers: MockCustomer[] = [
  {
    _id: 'cust1',
    name: 'John and Sarah Thompson',
    email: 'thompson.family@email.com',
    phone: '(512) 555-0123',
    address: {
      street: '789 Park Avenue',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA'
    },
    createdAt: '2023-06-15T00:00:00.000Z',
    updatedAt: '2023-06-15T00:00:00.000Z'
  },
  {
    _id: 'cust2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '(512) 555-0456',
    address: {
      street: '456 Tech Boulevard',
      city: 'Austin',
      state: 'TX',
      zipCode: '78702',
      country: 'USA'
    },
    createdAt: '2023-07-01T00:00:00.000Z',
    updatedAt: '2023-07-01T00:00:00.000Z'
  }
];

// Mock property transactions data
export const mockPropertyTransactions: MockPropertyTransaction[] = [
  {
    _id: 'trans1',
    propertyId: 'prop1',
    customerId: 'cust1',
    type: 'SALE',
    status: 'COMPLETED',
    amount: 1225000,
    date: '2023-07-20T00:00:00.000Z',
    details: {
      contractNumber: 'RH-2023-1201',
      paymentMethod: 'MORTGAGE',
      downPayment: 245000,
      mortgageDetails: {
        lender: 'Austin First Bank',
        amount: 980000,
        term: 30,
        interestRate: 4.5
      }
    },
    createdAt: '2023-06-15T00:00:00.000Z',
    updatedAt: '2023-07-20T00:00:00.000Z'
  },
  {
    _id: 'trans2',
    propertyId: 'prop2',
    customerId: 'cust2',
    type: 'RESERVATION',
    status: 'PENDING',
    amount: 25000,
    date: '2023-08-15T00:00:00.000Z',
    details: {
      contractNumber: 'RH-2023-1202',
      paymentMethod: 'WIRE_TRANSFER'
    },
    createdAt: '2023-08-15T00:00:00.000Z',
    updatedAt: '2023-08-15T00:00:00.000Z'
  }
];

// Helper function to create mock API responses
export function mockApiResponse(data: any, status = 200, delay = 0) {
  // Simulate network delay if specified
  if (delay > 0) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(NextResponse.json(data, { status }));
      }, delay);
    });
  }
  
  return NextResponse.json(data, { status });
}

// Helper function to find a document by ID
export function findDocumentById(id: string): MockDocument | undefined {
  return mockDocuments.find(doc => doc._id === id);
}

// Helper function to find documents by project ID
export function findDocumentsByProjectId(projectId: string): MockDocument[] {
  return mockDocuments.filter(doc => doc.projectId === projectId);
}

// Helper function to find a project by ID
export function findProjectById(id: string): MockProject | undefined {
  return mockProjects.find(project => project._id === id);
}

// Helper function to find loans by project ID
export function findLoansByProjectId(projectId: string): MockLoan[] {
  return mockLoans.filter(loan => loan.projectId === projectId);
}

// Helper function to find a loan by ID
export function findLoanById(id: string): MockLoan | undefined {
  return mockLoans.find(loan => loan._id === id);
}

// Helper function to find investments by project ID
export function findInvestmentsByProjectId(projectId: string): MockInvestment[] {
  return mockInvestments.filter(investment => investment.projectId === projectId);
}

// Helper function to find an investment by ID
export function findInvestmentById(id: string): MockInvestment | undefined {
  return mockInvestments.find(investment => investment._id === id);
}

// Helper function to find an investor by ID
export function findInvestorById(id: string): MockInvestor | undefined {
  return mockInvestors.find(investor => investor._id === id);
}

// Helper function to find transactions by project ID
export function findTransactionsByProjectId(projectId: string): MockTransaction[] {
  return mockTransactions.filter(transaction => transaction.projectId === projectId);
}

// Helper function to calculate loan payment schedule
export function calculateLoanSchedule(loan: MockLoan) {
  const { principalAmount, interestRate, termMonths, startDate } = loan;
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = (principalAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
  
  const schedule = [];
  let remainingPrincipal = principalAmount;
  let currentDate = new Date(startDate);
  
  for (let i = 1; i <= termMonths; i++) {
    const interestPayment = remainingPrincipal * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingPrincipal -= principalPayment;
    
    currentDate = new Date(currentDate);
    currentDate.setMonth(currentDate.getMonth() + 1);
    
    schedule.push({
      paymentNumber: i,
      paymentDate: currentDate.toISOString(),
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      remainingPrincipal: remainingPrincipal > 0 ? remainingPrincipal : 0
    });
  }
  
  return schedule;
}

// Helper function to calculate ROI for investments
export function calculateInvestmentROI(investment: MockInvestment) {
  const { amount, distributions } = investment;
  
  // Calculate total distributions
  const totalDistributions = distributions.reduce((sum, dist) => sum + dist.amount, 0);
  
  // Calculate ROI as a percentage
  const roi = (totalDistributions / amount) * 100;
  
  return {
    totalDistributed: totalDistributions,
    roi: roi,
    unrealizedROI: investment.expectedROI - roi
  };
}

// Helper function for pagination
export function paginateData<T>(data: T[], page = 1, limit = 10) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      total: data.length,
      page,
      limit,
      totalPages: Math.ceil(data.length / limit)
    }
  };
}

// Helper functions for the new mock data
export function findPropertyById(id: string): MockProperty | undefined {
  return mockProperties.find(property => property._id === id);
}

export function findPropertiesByProjectId(projectId: string): MockProperty[] {
  return mockProperties.filter(property => property.projectId === projectId);
}

export function findCustomerById(id: string): MockCustomer | undefined {
  return mockCustomers.find(customer => customer._id === id);
}

export function findTransactionsByPropertyId(propertyId: string): MockPropertyTransaction[] {
  return mockPropertyTransactions.filter(transaction => transaction.propertyId === propertyId);
}

export function findTransactionsByCustomerId(customerId: string): MockPropertyTransaction[] {
  return mockPropertyTransactions.filter(transaction => transaction.customerId === customerId);
} 
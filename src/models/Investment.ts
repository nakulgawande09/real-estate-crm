import mongoose, { Document, Schema } from 'mongoose';
import { InvestmentType } from '@/lib/enums';

export interface IInvestment extends Document {
  projectId: mongoose.Types.ObjectId;
  investorId: mongoose.Types.ObjectId;
  investorName: string;
  investorEmail: string;
  type: InvestmentType;
  amount: number;
  ownershipPercentage: number;
  investmentDate: Date;
  expectedROI: number;  // Expected ROI percentage
  actualROI: number;    // Actual ROI percentage (calculated)
  expectedReturns: number; // Expected return amount
  actualReturns: number;   // Actual returns received so far
  distributionSchedule: Array<{
    date: Date;
    amount: number;
    type: string;
    notes?: string;
    status: 'scheduled' | 'paid' | 'cancelled';
  }>;
  notes?: string;
  documents?: Array<{
    title: string;
    url: string;
    uploadDate: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const investmentSchema = new Schema<IInvestment>({
  projectId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true,
    index: true
  },
  investorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true,
    index: true
  },
  investorName: { 
    type: String, 
    required: true 
  },
  investorEmail: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: Object.values(InvestmentType), 
    required: true,
    default: InvestmentType.EQUITY
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  ownershipPercentage: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100,
    default: 0
  },
  investmentDate: { 
    type: Date, 
    required: true 
  },
  expectedROI: { 
    type: Number, 
    required: true 
  },
  actualROI: { 
    type: Number, 
    default: 0 
  },
  expectedReturns: { 
    type: Number, 
    required: true 
  },
  actualReturns: { 
    type: Number, 
    default: 0 
  },
  distributionSchedule: [{
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true, enum: ['dividend', 'distribution', 'interest', 'principal', 'other'] },
    notes: { type: String },
    status: { type: String, required: true, enum: ['scheduled', 'paid', 'cancelled'], default: 'scheduled' }
  }],
  notes: { 
    type: String 
  },
  documents: [{
    title: { type: String, required: true },
    url: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Pre-save hook to calculate expected returns
investmentSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('amount') || this.isModified('expectedROI')) {
    // Calculate expected returns based on investment type
    if (this.type === InvestmentType.EQUITY) {
      // For equity, expected returns is based on projected profit
      this.expectedReturns = this.amount * (this.expectedROI / 100);
    } else if (this.type === InvestmentType.DEBT) {
      // For debt, expected returns is the interest amount
      this.expectedReturns = this.amount * (this.expectedROI / 100);
    } else if (this.type === InvestmentType.PREFERRED_EQUITY) {
      // Preferred equity has a fixed return rate
      this.expectedReturns = this.amount * (this.expectedROI / 100);
    } else {
      // Default calculation
      this.expectedReturns = this.amount * (this.expectedROI / 100);
    }
  }
  
  // Calculate actual ROI based on actual returns
  if (this.actualReturns > 0 && this.amount > 0) {
    this.actualROI = (this.actualReturns / this.amount) * 100;
  }
  
  next();
});

// Create indexes for efficient querying
investmentSchema.index({ projectId: 1, investorId: 1 }, { unique: true });
investmentSchema.index({ investorId: 1, investmentDate: -1 });

// Create model
const Investment = mongoose.models.Investment || mongoose.model<IInvestment>('Investment', investmentSchema);

export default Investment; 
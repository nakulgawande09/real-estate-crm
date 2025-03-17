import mongoose, { Document, Schema } from 'mongoose';
import { LoanType, RepaymentFrequency } from '@/lib/enums';

export interface ILoan extends Document {
  projectId: mongoose.Types.ObjectId;
  lenderId: mongoose.Types.ObjectId;  // Could be a bank, institution, or individual
  lenderName: string;
  type: LoanType;
  amount: number;
  interestRate: number;  // Annual interest rate as a percentage
  term: number;  // Loan term in months
  startDate: Date;
  endDate: Date;
  repaymentFrequency: RepaymentFrequency;
  remainingBalance: number;
  nextPaymentDate: Date;
  paymentAmount: number;  // Regular payment amount
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  notes?: string;
  documents?: Array<{
    title: string;
    url: string;
    uploadDate: Date;
  }>;
  repaymentSchedule: Array<{
    date: Date;
    totalPayment: number;
    principalPayment: number;
    interestPayment: number;
    remainingBalance: number;
    isPaid: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>({
  projectId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true,
    index: true
  },
  lenderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true 
  },
  lenderName: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: Object.values(LoanType), 
    required: true,
    default: LoanType.CONSTRUCTION
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  interestRate: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  term: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  repaymentFrequency: { 
    type: String, 
    enum: Object.values(RepaymentFrequency), 
    default: RepaymentFrequency.MONTHLY, 
    required: true 
  },
  remainingBalance: { 
    type: Number, 
    required: true 
  },
  nextPaymentDate: { 
    type: Date, 
    required: true 
  },
  paymentAmount: { 
    type: Number, 
    required: true 
  },
  totalInterestPaid: { 
    type: Number, 
    default: 0 
  },
  totalPrincipalPaid: { 
    type: Number, 
    default: 0 
  },
  notes: { 
    type: String 
  },
  documents: [{
    title: { type: String, required: true },
    url: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
  }],
  repaymentSchedule: [{
    date: { type: Date, required: true },
    totalPayment: { type: Number, required: true },
    principalPayment: { type: Number, required: true },
    interestPayment: { type: Number, required: true },
    remainingBalance: { type: Number, required: true },
    isPaid: { type: Boolean, default: false }
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

// Pre-save hook to generate repayment schedule
loanSchema.pre('save', function(next) {
  // Only generate the schedule if this is a new loan or the relevant fields have changed
  if (this.isNew || this.isModified('amount') || this.isModified('interestRate') || 
      this.isModified('term') || this.isModified('startDate') || this.isModified('repaymentFrequency')) {
    
    this.repaymentSchedule = [];
    this.remainingBalance = this.amount;
    
    // Generate repayment schedule
    const monthlyInterestRate = this.interestRate / 100 / 12;
    let monthlyPayment = 0;
    
    // Calculate monthly payment (PMT formula)
    if (this.repaymentFrequency === RepaymentFrequency.BULLET) {
      // For bullet loans, just accrue interest
      monthlyPayment = this.amount * monthlyInterestRate;
    } else {
      // Standard amortization formula
      monthlyPayment = this.amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, this.term) / 
                      (Math.pow(1 + monthlyInterestRate, this.term) - 1);
    }
    
    // Adjust payment amount based on frequency
    let paymentMultiplier = 1;
    let paymentIntervalMonths = 1;
    
    switch (this.repaymentFrequency) {
      case RepaymentFrequency.MONTHLY:
        paymentMultiplier = 1;
        paymentIntervalMonths = 1;
        break;
      case RepaymentFrequency.QUARTERLY:
        paymentMultiplier = 3;
        paymentIntervalMonths = 3;
        break;
      case RepaymentFrequency.SEMI_ANNUALLY:
        paymentMultiplier = 6;
        paymentIntervalMonths = 6;
        break;
      case RepaymentFrequency.ANNUALLY:
        paymentMultiplier = 12;
        paymentIntervalMonths = 12;
        break;
    }
    
    // For non-bullet loans, adjust the payment
    if (this.repaymentFrequency !== RepaymentFrequency.BULLET) {
      this.paymentAmount = monthlyPayment * paymentMultiplier;
    } else {
      // For bullet loans, interest-only payments until term end, then full principal
      this.paymentAmount = this.amount * (this.interestRate / 100) * (paymentMultiplier / 12);
    }
    
    // Set the next payment date
    this.nextPaymentDate = new Date(this.startDate);
    this.nextPaymentDate.setMonth(this.nextPaymentDate.getMonth() + paymentIntervalMonths);
    
    // Generate the actual schedule
    let currentBalance = this.amount;
    let currentDate = new Date(this.startDate);
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;
    
    // For bullet loans, handle differently
    if (this.repaymentFrequency === RepaymentFrequency.BULLET) {
      // Add interest-only payments
      for (let i = 0; i < this.term / paymentIntervalMonths - 1; i++) {
        currentDate.setMonth(currentDate.getMonth() + paymentIntervalMonths);
        
        const interestPayment = currentBalance * (this.interestRate / 100) * (paymentIntervalMonths / 12);
        
        this.repaymentSchedule.push({
          date: new Date(currentDate),
          totalPayment: interestPayment,
          principalPayment: 0,
          interestPayment: interestPayment,
          remainingBalance: currentBalance,
          isPaid: false
        });
        
        totalInterestPaid += interestPayment;
      }
      
      // Add final payment with full principal
      currentDate.setMonth(currentDate.getMonth() + paymentIntervalMonths);
      const finalInterestPayment = currentBalance * (this.interestRate / 100) * (paymentIntervalMonths / 12);
      
      this.repaymentSchedule.push({
        date: new Date(currentDate),
        totalPayment: currentBalance + finalInterestPayment,
        principalPayment: currentBalance,
        interestPayment: finalInterestPayment,
        remainingBalance: 0,
        isPaid: false
      });
      
      totalInterestPaid += finalInterestPayment;
      totalPrincipalPaid = this.amount;
      
    } else {
      // Standard amortization schedule
      for (let i = 0; i < this.term / paymentIntervalMonths; i++) {
        currentDate.setMonth(currentDate.getMonth() + paymentIntervalMonths);
        
        // Calculate interest for the period
        const interestForPeriod = currentBalance * (this.interestRate / 100) * (paymentIntervalMonths / 12);
        
        // Calculate principal for the period
        let principalForPeriod = this.paymentAmount - interestForPeriod;
        
        // Adjust for final payment
        if (principalForPeriod > currentBalance) {
          principalForPeriod = currentBalance;
        }
        
        // Update running totals
        totalInterestPaid += interestForPeriod;
        totalPrincipalPaid += principalForPeriod;
        
        // Update current balance
        currentBalance -= principalForPeriod;
        
        // Add to schedule
        this.repaymentSchedule.push({
          date: new Date(currentDate),
          totalPayment: principalForPeriod + interestForPeriod,
          principalPayment: principalForPeriod,
          interestPayment: interestForPeriod,
          remainingBalance: currentBalance,
          isPaid: false
        });
        
        // Break if balance is fully paid
        if (currentBalance <= 0) {
          break;
        }
      }
    }
    
    // Update totals on the loan object
    this.totalInterestPaid = 0; // Start at 0 for a new loan
    this.totalPrincipalPaid = 0; // Start at 0 for a new loan
  }
  
  next();
});

// Create indexes
loanSchema.index({ projectId: 1, startDate: -1 });

// Create model
const Loan = mongoose.models.Loan || mongoose.model<ILoan>('Loan', loanSchema);

export default Loan; 
import mongoose, { Schema, Document } from 'mongoose';
import { 
  TransactionType, 
  TransactionStatus, 
  PaymentMethod, 
  PaymentFrequency 
} from '@/lib/enums';

export interface ITransaction extends Document {
  transactionType: TransactionType;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  project: mongoose.Types.ObjectId;
  client?: mongoose.Types.ObjectId;
  payee?: mongoose.Types.ObjectId; // User or external entity receiving payment
  payer?: mongoose.Types.ObjectId; // User or client making payment
  category?: string; 
  documents?: {
    title: string;
    fileUrl: string;
    uploadDate: Date;
  }[];
  notes?: string;
  // Loan specific fields
  loanDetails?: {
    principal: number;
    interestRate: number;
    term: number; // in months
    startDate: Date;
    endDate: Date;
    paymentFrequency: PaymentFrequency;
    lender: string;
  };
  // Investment specific fields
  investmentDetails?: {
    equityPercentage?: number;
    expectedReturn?: number;
    investmentTerm?: number; // in months
    investor: string;
  };
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionType: {
      type: String,
      enum: Object.values(TransactionType),
      required: [true, 'Transaction type is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required']
    },
    currency: {
      type: String,
      default: 'USD',
      required: [true, 'Currency is required']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod)
    },
    referenceNumber: {
      type: String,
      trim: true
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required']
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client'
    },
    payee: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    payer: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    category: {
      type: String,
      trim: true
    },
    documents: [{
      title: {
        type: String,
        required: true
      },
      fileUrl: {
        type: String,
        required: true
      },
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }],
    notes: {
      type: String
    },
    // Loan specific fields
    loanDetails: {
      principal: {
        type: Number
      },
      interestRate: {
        type: Number
      },
      term: {
        type: Number
      },
      startDate: {
        type: Date
      },
      endDate: {
        type: Date
      },
      paymentFrequency: {
        type: String,
        enum: Object.values(PaymentFrequency)
      },
      lender: {
        type: String
      }
    },
    // Investment specific fields
    investmentDetails: {
      equityPercentage: {
        type: Number
      },
      expectedReturn: {
        type: Number
      },
      investmentTerm: {
        type: Number
      },
      investor: {
        type: String
      }
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
TransactionSchema.index({ transactionType: 1 });
TransactionSchema.index({ date: -1 }); // Descending for recent transactions
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ project: 1 });
TransactionSchema.index({ client: 1 });
TransactionSchema.index({ payee: 1 });
TransactionSchema.index({ payer: 1 });
TransactionSchema.index({ amount: 1 });
TransactionSchema.index({ 'loanDetails.startDate': 1 });
TransactionSchema.index({ 'loanDetails.endDate': 1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema); 
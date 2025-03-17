import mongoose, { Document, Schema } from 'mongoose';
import { TransactionType } from '@/lib/enums';

export interface IFinancialTransaction extends Document {
  projectId: mongoose.Types.ObjectId;
  relatedEntityId?: mongoose.Types.ObjectId;  // Could be loan, investment, etc.
  relatedEntityType?: string;  // 'loan', 'investment', etc.
  date: Date;
  amount: number;
  type: TransactionType;
  description: string;
  category?: string;
  payee?: string;
  payeeId?: mongoose.Types.ObjectId;
  payeeType?: string;  // 'investor', 'lender', 'vendor', etc.
  referenceNumber?: string;
  attachments?: Array<{
    title: string;
    url: string;
    uploadDate: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const financialTransactionSchema = new Schema<IFinancialTransaction>({
  projectId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true,
    index: true
  },
  relatedEntityId: { 
    type: Schema.Types.ObjectId, 
    index: true
  },
  relatedEntityType: { 
    type: String,
    enum: ['loan', 'investment', 'expense', 'revenue', 'other']
  },
  date: { 
    type: Date, 
    required: true,
    index: true
  },
  amount: { 
    type: Number, 
    required: true 
  },
  type: { 
    type: String, 
    enum: Object.values(TransactionType), 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String 
  },
  payee: { 
    type: String 
  },
  payeeId: { 
    type: Schema.Types.ObjectId 
  },
  payeeType: { 
    type: String,
    enum: ['investor', 'lender', 'vendor', 'client', 'other']
  },
  referenceNumber: { 
    type: String 
  },
  attachments: [{
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

// Create indexes for efficient querying
financialTransactionSchema.index({ projectId: 1, date: -1 });
financialTransactionSchema.index({ projectId: 1, type: 1, date: -1 });
financialTransactionSchema.index({ relatedEntityId: 1, relatedEntityType: 1 });

// Create model
const FinancialTransaction = mongoose.models.FinancialTransaction || 
                            mongoose.model<IFinancialTransaction>('FinancialTransaction', financialTransactionSchema);

export default FinancialTransaction; 
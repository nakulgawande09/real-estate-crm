import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  email: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
  source: 'website' | 'referral' | 'social' | 'advertisement' | 'other';
  notes?: string;
  interestedIn?: mongoose.Types.ObjectId[];
  assignedTo?: mongoose.Types.ObjectId;
  lastContactDate?: Date;
  nextFollowUp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'unqualified', 'converted'],
      default: 'new'
    },
    source: {
      type: String,
      enum: ['website', 'referral', 'social', 'advertisement', 'other'],
      required: [true, 'Source is required']
    },
    notes: {
      type: String
    },
    interestedIn: [{
      type: Schema.Types.ObjectId,
      ref: 'Property'
    }],
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    lastContactDate: {
      type: Date
    },
    nextFollowUp: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for better performance
LeadSchema.index({ status: 1 });
LeadSchema.index({ assignedTo: 1 });
LeadSchema.index({ nextFollowUp: 1 });

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema); 
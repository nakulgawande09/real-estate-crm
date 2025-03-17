import mongoose, { Schema, Document } from 'mongoose';
import { 
  ClientType,
  ClientStatus,
  ClientSource,
  ClientDocumentType,
  InteractionType
} from '@/lib/enums';

export interface IClient extends Document {
  name: string;
  type: ClientType;
  contactInfo: {
    email: string;
    phone?: string;
    altPhone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  company?: {
    name: string;
    position: string;
    industry: string;
  };
  status: ClientStatus;
  source: ClientSource;
  referredBy?: mongoose.Types.ObjectId;
  projects: mongoose.Types.ObjectId[];
  transactions: mongoose.Types.ObjectId[];
  assignedAgent?: mongoose.Types.ObjectId;
  requirements?: {
    budget: {
      min: number;
      max: number;
      currency: string;
    };
    propertyTypes: string[];
    preferredLocations: string[];
    minBedrooms?: number;
    minBathrooms?: number;
    minArea?: number; // in square feet
    additionalRequirements?: string;
  };
  documents?: {
    title: string;
    fileUrl: string;
    uploadDate: Date;
    type: ClientDocumentType;
  }[];
  notes?: string;
  interactionHistory: {
    date: Date;
    type: InteractionType;
    description: string;
    outcome?: string;
    conductedBy: mongoose.Types.ObjectId;
  }[];
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: Object.values(ClientType),
      required: [true, 'Client type is required'],
      default: ClientType.INDIVIDUAL
    },
    contactInfo: {
      email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        unique: true
      },
      phone: {
        type: String,
        trim: true
      },
      altPhone: {
        type: String,
        trim: true
      },
      address: {
        street: {
          type: String,
          trim: true
        },
        city: {
          type: String,
          trim: true
        },
        state: {
          type: String,
          trim: true
        },
        zipCode: {
          type: String,
          trim: true
        },
        country: {
          type: String,
          default: 'USA',
          trim: true
        }
      }
    },
    company: {
      name: {
        type: String,
        trim: true
      },
      position: {
        type: String,
        trim: true
      },
      industry: {
        type: String,
        trim: true
      }
    },
    status: {
      type: String,
      enum: Object.values(ClientStatus),
      default: ClientStatus.ACTIVE
    },
    source: {
      type: String,
      enum: Object.values(ClientSource),
      required: [true, 'Source is required']
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'Client'
    },
    projects: [{
      type: Schema.Types.ObjectId,
      ref: 'Project'
    }],
    transactions: [{
      type: Schema.Types.ObjectId,
      ref: 'Transaction'
    }],
    assignedAgent: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    requirements: {
      budget: {
        min: {
          type: Number
        },
        max: {
          type: Number
        },
        currency: {
          type: String,
          default: 'USD'
        }
      },
      propertyTypes: [{
        type: String
      }],
      preferredLocations: [{
        type: String
      }],
      minBedrooms: {
        type: Number
      },
      minBathrooms: {
        type: Number
      },
      minArea: {
        type: Number
      },
      additionalRequirements: {
        type: String
      }
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
      },
      type: {
        type: String,
        enum: Object.values(ClientDocumentType),
        default: ClientDocumentType.OTHER
      }
    }],
    notes: {
      type: String
    },
    interactionHistory: [{
      date: {
        type: Date,
        default: Date.now,
        required: true
      },
      type: {
        type: String,
        enum: Object.values(InteractionType),
        required: true
      },
      description: {
        type: String,
        required: true
      },
      outcome: {
        type: String
      },
      conductedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    }],
    tags: [{
      type: String,
      trim: true
    }],
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
ClientSchema.index({ name: 1 });
ClientSchema.index({ 'contactInfo.email': 1 }, { unique: true });
ClientSchema.index({ status: 1 });
ClientSchema.index({ type: 1 });
ClientSchema.index({ assignedAgent: 1 });
ClientSchema.index({ source: 1 });
ClientSchema.index({ tags: 1 });

// Create text index for search
ClientSchema.index({ 
  name: 'text', 
  'contactInfo.email': 'text', 
  'company.name': 'text',
  'contactInfo.address.city': 'text'
});

// Create indexes for better performance
ClientSchema.index({ 'contactInfo.phone': 1 });
ClientSchema.index({ status: 1 });
ClientSchema.index({ source: 1 });
ClientSchema.index({ assignedAgent: 1 });
ClientSchema.index({ createdAt: -1 });

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema); 
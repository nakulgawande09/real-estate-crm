import mongoose, { Schema, Document } from 'mongoose';
import { PropertyType, ProjectStatus, DocumentType } from '@/lib/enums';

export interface ICostBreakdown {
  land: number;
  construction: number;
  permits: number;
  marketing: number;
  legal: number;
  financing: number;
  other: number;
}

export interface IProject extends Document {
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  propertyType: PropertyType;
  status: ProjectStatus;
  acquisitionDate: Date;
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  totalBudget: number;
  costBreakdown: ICostBreakdown;
  financials: {
    totalLoans: number;
    totalInvestments: number;
    directInvestments: number;
  };
  projectManager?: mongoose.Types.ObjectId;
  team?: mongoose.Types.ObjectId[];
  clients?: mongoose.Types.ObjectId[];
  documents: {
    title: string;
    fileUrl: string;
    uploadDate: Date;
    type: DocumentType;
  }[];
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
        trim: true,
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        default: 'USA',
      },
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    propertyType: {
      type: String,
      enum: Object.values(PropertyType),
      required: [true, 'Property type is required'],
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.PLANNING,
      required: [true, 'Project status is required'],
    },
    acquisitionDate: {
      type: Date,
      required: [true, 'Acquisition date is required'],
    },
    estimatedCompletionDate: {
      type: Date,
    },
    actualCompletionDate: {
      type: Date,
    },
    totalBudget: {
      type: Number,
      required: [true, 'Total budget is required'],
      min: [0, 'Total budget cannot be negative'],
    },
    costBreakdown: {
      land: {
        type: Number,
        default: 0,
        min: [0, 'Land cost cannot be negative'],
      },
      construction: {
        type: Number,
        default: 0,
        min: [0, 'Construction cost cannot be negative'],
      },
      permits: {
        type: Number,
        default: 0,
        min: [0, 'Permits cost cannot be negative'],
      },
      marketing: {
        type: Number,
        default: 0,
        min: [0, 'Marketing cost cannot be negative'],
      },
      legal: {
        type: Number,
        default: 0,
        min: [0, 'Legal cost cannot be negative'],
      },
      financing: {
        type: Number,
        default: 0, 
        min: [0, 'Financing cost cannot be negative'],
      },
      other: {
        type: Number,
        default: 0,
        min: [0, 'Other costs cannot be negative'],
      },
    },
    financials: {
      totalLoans: {
        type: Number,
        default: 0,
        min: [0, 'Total loans cannot be negative'],
      },
      totalInvestments: {
        type: Number,
        default: 0,
        min: [0, 'Total investments cannot be negative'],
      },
      directInvestments: {
        type: Number,
        default: 0,
        min: [0, 'Direct investments cannot be negative'],
      },
    },
    projectManager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    team: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    clients: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
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
        enum: Object.values(DocumentType),
        default: DocumentType.OTHER
      }
    }],
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total budget from cost breakdown
ProjectSchema.pre('save', function(next) {
  const project = this as any;
  const { land, construction, permits, marketing, legal, financing, other } = project.costBreakdown;
  project.totalBudget = land + construction + permits + marketing + legal + financing + other;
  next();
});

// Create indexes for better query performance
ProjectSchema.index({ name: 1 });
ProjectSchema.index({ 'location.city': 1, 'location.state': 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ projectManager: 1 });
ProjectSchema.index({ acquisitionDate: 1 });
ProjectSchema.index({ propertyType: 1 });

// Create text index for search
ProjectSchema.index({ 
  name: 'text', 
  description: 'text', 
  'location.address': 'text', 
  'location.city': 'text' 
});

// Check if the model already exists to prevent overwriting during hot reloads
const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project; 
import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  propertyType: 'house' | 'apartment' | 'condo' | 'land' | 'commercial';
  listingType: 'sale' | 'rent';
  price: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number; // in square feet
    yearBuilt?: number;
    parking?: number;
  };
  amenities: string[];
  images: string[];
  status: 'active' | 'pending' | 'sold' | 'inactive';
  agent: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    propertyType: {
      type: String,
      enum: ['house', 'apartment', 'condo', 'land', 'commercial'],
      required: [true, 'Property type is required']
    },
    listingType: {
      type: String,
      enum: ['sale', 'rent'],
      required: [true, 'Listing type is required']
    },
    price: {
      type: Number,
      required: [true, 'Price is required']
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required']
      },
      city: {
        type: String,
        required: [true, 'City is required']
      },
      state: {
        type: String,
        required: [true, 'State is required']
      },
      zipCode: {
        type: String,
        required: [true, 'Zip code is required']
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        default: 'USA'
      }
    },
    features: {
      bedrooms: {
        type: Number,
        required: function(this: IProperty) {
          return ['house', 'apartment', 'condo'].includes(this.propertyType);
        },
        default: function(this: IProperty) {
          return ['house', 'apartment', 'condo'].includes(this.propertyType) ? 0 : undefined;
        }
      },
      bathrooms: {
        type: Number,
        required: function(this: IProperty) {
          return ['house', 'apartment', 'condo'].includes(this.propertyType);
        },
        default: function(this: IProperty) {
          return ['house', 'apartment', 'condo'].includes(this.propertyType) ? 0 : undefined;
        }
      },
      area: {
        type: Number,
        required: [true, 'Area is required']
      },
      yearBuilt: {
        type: Number
      },
      parking: {
        type: Number
      }
    },
    amenities: [{
      type: String
    }],
    images: [{
      type: String
    }],
    status: {
      type: String,
      enum: ['active', 'pending', 'sold', 'inactive'],
      default: 'active'
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Agent is required']
    }
  },
  {
    timestamps: true
  }
);

// Create text index for search
PropertySchema.index({ 
  title: 'text', 
  description: 'text', 
  'address.city': 'text', 
  'address.state': 'text' 
});

export default mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema); 
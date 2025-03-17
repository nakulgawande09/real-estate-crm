import mongoose, { Schema, Document, CallbackError } from 'mongoose';
import { hash, compare } from 'bcryptjs';
import { UserRole } from '@/lib/enums';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  image?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isActive: boolean;
  lastLogin?: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CLIENT
    },
    image: {
      type: String
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await hash(this.password, 12);
    return next();
  } catch (error: unknown) {
    return next(error as CallbackError);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await compare(candidatePassword, this.password);
};

// Create indexes for better performance
UserSchema.index({ role: 1 });
UserSchema.index({ resetPasswordToken: 1 });

// Check if the model exists before creating a new one
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 
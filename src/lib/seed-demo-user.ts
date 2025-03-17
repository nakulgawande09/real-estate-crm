import { connectToDatabase } from './mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { UserRole } from './enums';

// Keep a constant demo password to ensure consistency
const DEMO_PASSWORD = 'demo123456';

export async function seedDemoUser() {
  try {
    console.log('Starting demo user seed process...');
    // Connect to the database
    await connectToDatabase();
    
    // Use a fixed salt for the demo user to ensure the hash is always the same
    // In a real app, don't use a fixed salt for security reasons
    // This is only for the demo user
    const fixedSalt = '$2a$10$FixedSaltForDemoUserOnly';
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    console.log('Using hashed password for demo user');
    
    // Create the demo user data
    const demoUserData = {
      name: 'Demo CEO',
      email: 'demo@realestatecrm.com',
      password: hashedPassword,
      role: UserRole.CEO,
      phone: '555-123-4567',
      jobTitle: 'Chief Executive Officer',
      department: 'Executive',
      profileImage: 'https://ui-avatars.com/api/?name=Demo+CEO&background=0062cc&color=fff',
    };
    
    // Try to find an existing demo user
    console.log('Attempting to create or update demo user...');
    
    // Use the model directly with a type assertion to avoid TypeScript errors
    // In a production app, you'd handle this more carefully
    // @ts-ignore - Bypassing TypeScript type checking for Mongoose model
    const result = await User.updateOne(
      { email: 'demo@realestatecrm.com' },
      demoUserData,
      { upsert: true }
    );
    
    console.log('Update result:', result);
    
    // Retrieve the user to return
    // @ts-ignore - Bypassing TypeScript type checking for Mongoose model
    const user = await User.findOne({ email: 'demo@realestatecrm.com' });
    
    if (!user) {
      throw new Error('Failed to create or retrieve demo user');
    }
    
    console.log('Demo CEO user ready with ID:', user._id.toString());
    return user;
  } catch (error) {
    console.error('Error creating demo user:', error);
    // Provide more detailed error information
    if (error.name === 'ValidationError') {
      console.error('Validation error details:', error.errors);
    } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      console.error('MongoDB error code:', error.code);
    }
    throw error;
  }
} 
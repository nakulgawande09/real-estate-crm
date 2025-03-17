import { NextRequest, NextResponse } from 'next/server';
import { seedDemoUser } from '@/lib/seed-demo-user';
import { mockUsers, mockApiResponse } from '@/lib/mockData';
import { UserRole } from '@/lib/enums';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

export async function GET(request: NextRequest) {
  console.log('Demo user API route called');
  
  try {
    if (USE_MOCK_DATA) {
      // Find demo CEO user
      const demoUser = mockUsers.find(user => user.role === UserRole.CEO);
      
      if (demoUser) {
        return mockApiResponse({
          success: true,
          exists: true,
          user: {
            email: demoUser.email,
            password: demoUser.password,
            id: demoUser._id,
            role: demoUser.role
          }
        });
      } else {
        return mockApiResponse({
          success: false,
          exists: false,
          message: 'Demo user not found'
        });
      }
    }
    
    // Original MongoDB implementation would be here
    
    // Return mock data for now
    return mockApiResponse({ 
      success: false,
      message: "Mock implementation - Original MongoDB implementation would be here" 
    });
  } catch (error) {
    console.error('Error in demo-user API route:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check demo user' 
      },
      { status: 500 }
    );
  }
} 
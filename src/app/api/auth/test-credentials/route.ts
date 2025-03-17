import { NextRequest, NextResponse } from 'next/server';
import { mockUsers, mockApiResponse } from '@/lib/mockData';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

export async function POST(request: NextRequest) {
  try {
    // Parse request body to get credentials
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (USE_MOCK_DATA) {
      // Find user with matching email
      const user = mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return mockApiResponse({ 
          success: false,
          error: 'User not found'
        }, 404);
      }
      
      // For demo purposes, accept 'demo123' as the password for any mock user
      const isValidPassword = password === 'demo123';
      
      if (!isValidPassword) {
        return mockApiResponse({ 
          success: false,
          error: 'Invalid password'
        }, 401);
      }
      
      // Return success with user information (excluding any sensitive data)
      return mockApiResponse({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
    
    // Original MongoDB implementation would be here
    
    // Return mock data for now
    return mockApiResponse({ message: "Mock implementation - Original MongoDB implementation would be here" });
  } catch (error) {
    console.error('Error testing credentials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test credentials' },
      { status: 500 }
    );
  }
} 
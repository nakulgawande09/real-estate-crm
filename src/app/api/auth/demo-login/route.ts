import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mockData';
import { UserRole } from '@/lib/enums';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

// Flag to determine if we should use mock data
const USE_MOCK_DATA = true;

export async function POST(request: NextRequest) {
  console.log('Demo login API route called');
  
  try {
    if (USE_MOCK_DATA) {
      // Find demo CEO user
      const demoUser = mockUsers.find(user => user.role === UserRole.CEO);
      
      if (!demoUser) {
        return NextResponse.json(
          { success: false, error: 'Demo user not found' },
          { status: 404 }
        );
      }
      
      // Create a demo login session with NextAuth
      const response = NextResponse.json({
        success: true,
        user: {
          id: demoUser._id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role
        }
      });
      
      // Set required cookies for auto-login redirect
      const cookieStore = cookies();
      const callbackUrl = '/dashboard';
      
      cookieStore.set('next-auth.callback-url', callbackUrl, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      
      return response;
    }
    
    // Original MongoDB implementation would be here
    return NextResponse.json({ 
      success: false,
      message: "Mock implementation - Original MongoDB implementation would be here" 
    });
  } catch (error) {
    console.error('Error in demo-login API route:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to login with demo account' 
      },
      { status: 500 }
    );
  }
} 
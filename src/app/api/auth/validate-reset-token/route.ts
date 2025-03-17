import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find user with valid reset token and token not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { valid: true, email: user.email },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error validating reset token:', error);
    return NextResponse.json(
      { error: 'An error occurred while validating the token' },
      { status: 500 }
    );
  }
} 
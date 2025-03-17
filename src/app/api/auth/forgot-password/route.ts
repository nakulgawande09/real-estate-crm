import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { sendEmail } from '@/lib/email'; // You'll need to create this utility

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find the user
    const user = await User.findOne({ email });

    // If no user found, still return success to prevent user enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with this email, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate a reset token (random bytes converted to hex)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set the reset token and expiry (valid for 1 hour)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    // Create reset URL (replace with your actual frontend URL)
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    // Email content
    const subject = 'Real Estate CRM - Password Reset';
    const text = `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\n
      Please click on the following link, or paste it into your browser to complete the process:\n\n
      ${resetUrl}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`;

    // Send email (you'll need to implement this function)
    // This is a placeholder - you need to implement actual email sending
    await sendEmail({
      to: user.email,
      subject,
      text,
    });

    return NextResponse.json(
      { message: 'If an account exists with this email, a password reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in forgot password API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 
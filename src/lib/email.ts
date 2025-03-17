/**
 * Email service utility for the Real Estate CRM
 * 
 * Note: This is a placeholder implementation. You'll need to replace this
 * with an actual email service implementation like SendGrid, AWS SES, etc.
 */

interface EmailProps {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sends an email using the configured email provider
 * 
 * IMPORTANT: Replace this implementation with an actual email service
 * such as Nodemailer with SMTP, SendGrid, AWS SES, etc.
 */
export async function sendEmail({ to, subject, text, html }: EmailProps): Promise<void> {
  // Log the email details in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('=========== EMAIL WOULD BE SENT ===========');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    if (html) console.log(`HTML: ${html}`);
    console.log('===========================================');
    return;
  }

  // PLACEHOLDER: Replace with actual email sending logic
  // Example using a service like SendGrid:
  // 
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // 
  // const msg = {
  //   to,
  //   from: process.env.EMAIL_FROM,
  //   subject,
  //   text,
  //   html: html || text,
  // };
  // 
  // await sgMail.send(msg);

  // For now, just simulate sending by logging to console
  console.log(`Email sent to ${to}`);
}

/**
 * Send a password reset email to a user
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  const subject = 'Real Estate CRM - Password Reset';
  const text = `
    You are receiving this email because you (or someone else) has requested a password reset for your account.
    
    Please click on the following link, or paste it into your browser to complete the process:
    
    ${resetUrl}
    
    If you did not request this, please ignore this email and your password will remain unchanged.
  `;

  await sendEmail({
    to: email,
    subject,
    text,
  });
}

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  const subject = 'Welcome to Real Estate CRM';
  const text = `
    Hi ${name},
    
    Welcome to Real Estate CRM! We're excited to have you on board.
    
    You can now log in to your account and start using the system.
    
    Best regards,
    The Real Estate CRM Team
  `;

  await sendEmail({
    to: email,
    subject,
    text,
  });
} 
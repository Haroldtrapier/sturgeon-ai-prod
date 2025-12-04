import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// In-memory storage for reset tokens (use database in production!)
const resetTokens = new Map<string, { email: string; expires: number }>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour from now

    // Store token (in production, store in database with user)
    resetTokens.set(token, { email, expires });

    // Clean up expired tokens
    for (const [key, value] of resetTokens.entries()) {
      if (value.expires < Date.now()) {
        resetTokens.delete(key);
      }
    }

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${token}`;

    // Send email (configure your SMTP settings)
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@sturgeonai.com',
        to: email,
        subject: 'Reset Your Password - Sturgeon AI',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password for Sturgeon AI.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetLink}" 
               style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Reset Password
            </a>
            <p>Or copy this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${resetLink}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
          </div>
        `,
      });

      console.log('Password reset email sent to:', email);
    } else {
      // Development mode - just log the reset link
      console.log('\n=================================');
      console.log('PASSWORD RESET LINK (DEV MODE):');
      console.log(resetLink);
      console.log('=================================\n');
    }

    return res.status(200).json({ 
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      error: 'Failed to send reset email',
      details: error.message,
    });
  }
}

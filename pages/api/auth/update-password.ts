import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// In-memory storage for reset tokens (use database in production!)
// This should be the same storage used in reset-password.ts
const resetTokens = new Map<string, { email: string; expires: number }>();

// In-memory user storage (use database in production!)
// This is just for demo - in production, update your actual database
const users = new Map<string, { email: string; password: string }>();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, password } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Reset token is required' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify token
    const tokenData = resetTokens.get(token);

    if (!tokenData) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    // Check if token is expired
    if (tokenData.expires < Date.now()) {
      resetTokens.delete(token);
      return res.status(400).json({ 
        error: 'Reset token has expired. Please request a new password reset.' 
      });
    }

    // Hash the new password
    const hashedPassword = hashPassword(password);

    // Update user password in your database
    // For demo purposes, we're using in-memory storage
    users.set(tokenData.email, {
      email: tokenData.email,
      password: hashedPassword,
    });

    // Invalidate the token
    resetTokens.delete(token);

    console.log(`Password updated successfully for: ${tokenData.email}`);

    // In production, you might want to:
    // 1. Update the password in your database
    // 2. Send a confirmation email
    // 3. Invalidate all existing sessions
    // 4. Log the password change for security audit

    return res.status(200).json({ 
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error: any) {
    console.error('Update password error:', error);
    return res.status(500).json({
      error: 'Failed to update password',
      details: error.message,
    });
  }
}

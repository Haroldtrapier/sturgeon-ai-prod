import * as jwt from 'jsonwebtoken';
import { NextApiResponse } from 'next';

// JWT secret from environment variable (ensure this is set in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '7d'; // 7 days
const REFRESH_TOKEN_EXPIRY = '30d'; // 30 days

/**
 * Generates a JWT token for the given user ID
 * @param userId - The user ID to encode in the token
 * @returns A signed JWT token string
 */
export async function generateToken(userId: string): Promise<string> {
  try {
    const token = jwt.sign(
      { 
        userId,
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      { 
        expiresIn: ACCESS_TOKEN_EXPIRY,
        algorithm: 'HS256'
      }
    );
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

/**
 * Sets authentication cookies on the response
 * @param res - Next.js API response object
 * @param token - The JWT token to set as a cookie
 * @param refreshToken - Optional refresh token from Supabase
 */
export async function setAuthCookie(
  res: NextApiResponse,
  token: string,
  refreshToken?: string
): Promise<void> {
  try {
    // Set the main auth cookie with secure options
    const cookieOptions = [
      `auth_token=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${7 * 24 * 60 * 60}`, // 7 days in seconds
    ];

    // Add Secure flag in production
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.push('Secure');
    }

    res.setHeader('Set-Cookie', [
      cookieOptions.join('; '),
      // Optionally set refresh token cookie if provided
      ...(refreshToken ? [
        [
          `refresh_token=${refreshToken}`,
          'Path=/',
          'HttpOnly',
          'SameSite=Lax',
          `Max-Age=${30 * 24 * 60 * 60}`, // 30 days in seconds
          ...(process.env.NODE_ENV === 'production' ? ['Secure'] : [])
        ].join('; ')
      ] : [])
    ]);
  } catch (error) {
    console.error('Error setting auth cookie:', error);
    throw new Error('Failed to set authentication cookie');
  }
}

/**
 * CORS headers for cross-origin requests
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

/**
 * Verifies a JWT token and returns the decoded payload
 * @param token - The JWT token to verify
 * @returns The decoded token payload
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Invalid or expired token');
  }
}

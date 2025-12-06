import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '../../../lib/supabase-server';
import { generateToken, setAuthCookie, corsHeaders } from '../../../lib/auth-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const supabase = createServerSupabaseClient({ req, res });

    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);

      // Return user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (error.message.includes('Email not confirmed')) {
        return res.status(401).json({ error: 'Please verify your email address' });
      }

      return res.status(400).json({ error: error.message });
    }

    if (!data.user || !data.session) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Generate custom JWT token
    const token = generateToken(data.user.id);

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Set auth cookie (7–30 days expiry as appropriate)
    setAuthCookie(res, token, data.session.refresh_token);

    // Return success response with user, session, and token data
    // Note: Token is included in response body as per requirements, in addition to HTTP-only cookie
    // This allows client-side access while maintaining security through short expiry and cookie backup
    return res.status(200).json({
      success: true,
      user: { id: data.user.id, email: data.user.email },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
      token,
    });
  } catch (error) {
    console.error('Unexpected login error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

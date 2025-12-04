import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials not configured');
    return res.status(500).json({ error: 'Authentication service not configured' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({ error: error.message || 'Invalid login credentials' });
    }

    if (!data.session) {
      return res.status(401).json({ error: 'Failed to create session' });
    }

    // Set the session cookie
    res.setHeader('Set-Cookie', [
      `sb-access-token=${data.session.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600`,
      `sb-refresh-token=${data.session.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
    ]);

    return res.status(200).json({
      success: true,
      user: data.user,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
}

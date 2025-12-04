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

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials not configured');
    return res.status(500).json({ error: 'Authentication service not configured' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Determine the redirect URL based on environment
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.host || 'localhost:3000';
    const redirectTo = `${protocol}://${host}/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      console.error('Password reset error:', error);
      return res.status(400).json({ error: error.message || 'Failed to send reset email' });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'An error occurred while processing your request' });
  }
}

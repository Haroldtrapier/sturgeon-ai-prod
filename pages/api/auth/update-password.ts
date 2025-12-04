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

  const { password, accessToken } = req.body;

  if (!password || !accessToken) {
    return res.status(400).json({ error: 'Password and access token are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials not configured');
    return res.status(500).json({ error: 'Authentication service not configured' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Create a Supabase client with the access token for this specific request
    const supabaseWithToken = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    // Update the password using the authenticated client
    const { error: updateError } = await supabaseWithToken.auth.updateUser({
      password,
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(400).json({ error: updateError.message || 'Failed to update password' });
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error: any) {
    console.error('Password update error:', error);
    return res.status(500).json({ error: 'An error occurred while updating your password' });
  }
}

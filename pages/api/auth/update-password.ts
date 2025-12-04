import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for required environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return res.status(500).json({ error: 'Server configuration error. Please contact support.' });
  }

  try {
    const { password } = req.body;

    // Validation
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Get the access token from the Authorization header
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ error: 'Unauthorized: No access token provided' });
    }

    // Create Supabase client with the user's access token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    // Update the user's password
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('Supabase password update error:', error);
      return res.status(400).json({ 
        error: error.message || 'Failed to update password' 
      });
    }

    return res.status(200).json({ 
      message: 'Password updated successfully',
      user: data.user,
    });

  } catch (error) {
    console.error('Update password error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return res.status(500).json({ 
      error: 'Internal server error. Please try again.' 
    });
  }
}

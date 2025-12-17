import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Use SUPABASE_URL for server-side, with fallback to NEXT_PUBLIC version
// Note: NEXT_PUBLIC_SUPABASE_ANON_KEY fallback is for compatibility only.
// Production should use SUPABASE_SERVICE_ROLE_KEY for proper permissions.
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  ?? process.env.SUPABASE_KEY
  ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, fullName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Check if environment variables are configured
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return res.status(500).json({ error: 'Server configuration error - Supabase not configured' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
      },
    });

    if (error) {
      console.error('Signup error:', error);

      // Return user-friendly error messages
      if (error.message.includes('already registered')) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }

      if (error.message.includes('invalid email')) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
      }

      if (error.message.includes('Password should be')) {
        return res.status(400).json({ error: 'Password does not meet requirements' });
      }

      return res.status(400).json({ error: error.message });
    }

    if (!data.user) {
      return res.status(400).json({ error: 'Failed to create account' });
    }

    // Check if email confirmation is required
    const emailConfirmationRequired = !data.session;

    return res.status(200).json({
      message: emailConfirmationRequired 
        ? 'Account created! Please check your email to verify your account.'
        : 'Account created successfully!',
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
      },
      emailConfirmationRequired,
    });
  } catch (error) {
    console.error('Unexpected signup error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' });
  }
}

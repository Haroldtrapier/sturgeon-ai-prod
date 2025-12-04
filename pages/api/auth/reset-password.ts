import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '../../../lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const supabase = createServerSupabaseClient({ req, res });

    // Get the current session (set by the magic link from the email)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(400).json({ error: 'Failed to update password' });
    }

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

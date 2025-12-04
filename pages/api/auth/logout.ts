import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '../../../lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createServerSupabaseClient({ req, res });

    // Sign out the user
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return res.status(400).json({ error: 'Failed to logout' });
    }

    // Clear all auth cookies
    res.setHeader('Set-Cookie', [
      'sb-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax',
      'sb-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax',
    ]);

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Unexpected logout error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

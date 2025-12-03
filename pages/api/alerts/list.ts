import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved searches:', error);
      return res.status(500).json({ error: 'Failed to fetch alerts' });
    }

    return res.status(200).json({ savedSearches: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

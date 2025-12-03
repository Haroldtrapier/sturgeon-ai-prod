import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, query, marketplace } = req.body;

    if (!name || !query) {
      return res.status(400).json({ error: 'Name and query are required' });
    }

    const { data, error } = await supabase
      .from('saved_searches')
      .insert([
        {
          name,
          query,
          marketplace: marketplace || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating saved search:', error);
      return res.status(500).json({ error: 'Failed to create alert' });
    }

    return res.status(201).json({ savedSearch: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

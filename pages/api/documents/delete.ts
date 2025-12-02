import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Document ID is required' })
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting document:', error)
      return res.status(500).json({ error: 'Failed to delete document' })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage for demonstration purposes
// In production, this would use a database like Supabase
let winsStore: any[] = [];
let nextId = 1;

type Win = {
  id: string;
  opportunityTitle: string;
  agency: string | null;
  amount: number | null;
  contractNumber: string | null;
  description: string | null;
  dateWon: string | null;
  createdAt: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Return all wins
    return res.status(200).json({ wins: winsStore });
  }

  if (req.method === 'POST') {
    try {
      const {
        opportunityTitle,
        agency,
        amount,
        contractNumber,
        description,
        dateWon,
      } = req.body;

      // Validate required fields
      if (!opportunityTitle || opportunityTitle.trim() === '') {
        return res.status(400).json({ error: 'Opportunity title is required' });
      }

      // Create new win
      const newWin: Win = {
        id: String(nextId++),
        opportunityTitle: opportunityTitle.trim(),
        agency: agency && agency.trim() !== '' ? agency.trim() : null,
        amount: amount != null && !isNaN(Number(amount)) ? Number(amount) : null,
        contractNumber: contractNumber && contractNumber.trim() !== '' ? contractNumber.trim() : null,
        description: description && description.trim() !== '' ? description.trim() : null,
        dateWon: dateWon && dateWon.trim() !== '' ? dateWon.trim() : null,
        createdAt: new Date().toISOString(),
      };

      winsStore.push(newWin);

      return res.status(201).json({ win: newWin });
    } catch (error) {
      console.error('Error creating win:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

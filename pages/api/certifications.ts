import type { NextApiRequest, NextApiResponse } from 'next';

type Certification = {
  id: string;
  certType: string;
  status: string;
  notes: string | null;
  checklist: any; // Using any to match the problem statement specification
};

// In-memory storage (in production, this would be a database)
let certifications: Certification[] = [];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Return all certifications
    return res.status(200).json({ applications: certifications });
  } else if (req.method === 'POST') {
    // Create a new certification
    try {
      const { certType, status, notes } = req.body;

      if (!certType || !status) {
        return res.status(400).json({ error: 'certType and status are required' });
      }

      const newCert: Certification = {
        id: Date.now().toString(), // Simple ID for in-memory storage. Use UUID in production.
        certType,
        status,
        notes: notes || null,
        checklist: null,
      };

      certifications.push(newCert);

      return res.status(201).json(newCert);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create certification' });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';

type Rec = {
  proposalId: string;
  title: string;
  fitScore: number;
  source: string;
  why: string;
};

type ResponseData = {
  recommendations?: Rec[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Mock recommendations for demonstration
    // In a real implementation, this would call an AI service or database
    const mockRecommendations: Rec[] = [
      {
        proposalId: 'P-2024-001',
        title: 'AI-Powered Contract Analysis Tool',
        fitScore: 0.92,
        source: 'Internal Database',
        why: 'Strong alignment with AI/ML requirements and contract analysis needs mentioned in the opportunity.',
      },
      {
        proposalId: 'P-2024-002',
        title: 'Government Portal Integration Platform',
        fitScore: 0.85,
        source: 'Past Proposals',
        why: 'Previous experience with similar federal integration requirements and compliance standards.',
      },
      {
        proposalId: 'P-2023-056',
        title: 'Data Analytics Dashboard for Federal Agencies',
        fitScore: 0.78,
        source: 'Internal Database',
        why: 'Relevant data visualization and reporting capabilities that match opportunity requirements.',
      },
    ];

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    return res.status(200).json({ recommendations: mockRecommendations });
  } catch (error) {
    console.error('Error in recommendations API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

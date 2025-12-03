import { NextApiRequest, NextApiResponse } from 'next';

type Profile = {
  email: string;
  full_name?: string;
  id: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Profile>
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  // Mock profile data for demonstration
  const profile: Profile = {
    id: 'usr_123456789',
    email: 'user@example.com',
    full_name: 'John Doe',
  };

  res.status(200).json(profile);
}

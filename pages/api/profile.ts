import type { NextApiRequest, NextApiResponse } from 'next';

type ProfileData = {
  companyName: string;
  naicsCodes: string[];
  pscCodes: string[];
  certifications: string[];
};

type ProfileResponse = {
  profile?: ProfileData;
  error?: string;
};

// In-memory storage for demo purposes only
// WARNING: In a production app, this would be stored in a database with proper user authentication
// Current implementation is shared across all users and resets on server restart
let profileData: ProfileData = {
  companyName: '',
  naicsCodes: [],
  pscCodes: [],
  certifications: [],
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProfileResponse>
) {
  if (req.method === 'GET') {
    // Return the current profile data
    res.status(200).json({ profile: profileData });
  } else if (req.method === 'POST') {
    // Update profile data
    try {
      const { companyName, naicsCodes, pscCodes, certifications } = req.body;
      
      profileData = {
        companyName: companyName || profileData.companyName,
        naicsCodes: naicsCodes || profileData.naicsCodes,
        pscCodes: pscCodes || profileData.pscCodes,
        certifications: certifications || profileData.certifications,
      };
      
      res.status(200).json({ profile: profileData });
    } catch (error) {
      res.status(400).json({ error: 'Invalid request data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    service: "Sturgeon AI",
    status: "operational",
    version: "2.0.0"
  });
}

import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Mock profile data - in a real app, this would come from a database
    res.status(200).json({
      profile: {
        companyName: "Sturgeon AI",
        naicsCodes: ["541511", "541512", "541519"],
        pscCodes: ["D302", "D307", "R408"],
        certifications: ["8(a)", "SDVOSB", "HUBZone"],
      },
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

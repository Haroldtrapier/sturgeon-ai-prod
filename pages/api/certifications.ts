import type { NextApiRequest, NextApiResponse } from "next";

// In-memory storage for certifications (replace with database later)
let certifications: any[] = [];
let nextId = 1;

type CertificationData = {
  certType: string;
  status: string;
  notes: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Get all certifications
    res.status(200).json({
      success: true,
      applications: certifications,
    });
  } else if (req.method === "POST") {
    // Create a new certification
    try {
      const { certType, status, notes } = req.body as CertificationData;

      if (!certType || !status) {
        return res.status(400).json({
          error: "certType and status are required",
        });
      }

      const newCert = {
        id: String(nextId++),
        certType,
        status,
        notes: notes || null,
        checklist: {},
        createdAt: new Date().toISOString(),
      };

      certifications.push(newCert);

      res.status(201).json({
        success: true,
        application: newCert,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to create certification",
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

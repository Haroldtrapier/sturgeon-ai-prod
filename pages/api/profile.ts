import { NextApiRequest, NextApiResponse } from "next";

interface Profile {
  companyName: string;
  naicsCodes: string[];
  pscCodes: string[];
  cageCode: string;
  duns: string;
  capabilitiesSummary: string;
  certifications: string[];
  phone: string;
  website: string;
}

// In-memory storage for demo purposes
// In production, this would connect to a database
let profileStore: Profile | null = null;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Return the stored profile or empty profile
    return res.status(200).json({
      profile: profileStore || {
        companyName: "",
        naicsCodes: [],
        pscCodes: [],
        cageCode: "",
        duns: "",
        capabilitiesSummary: "",
        certifications: [],
        phone: "",
        website: "",
      },
    });
  }

  if (req.method === "POST") {
    try {
      const {
        companyName,
        naicsCodes,
        pscCodes,
        cageCode,
        duns,
        capabilitiesSummary,
        certifications,
        phone,
        website,
      } = req.body;

      // Validate and store the profile
      profileStore = {
        companyName: companyName || "",
        naicsCodes: Array.isArray(naicsCodes) ? naicsCodes : [],
        pscCodes: Array.isArray(pscCodes) ? pscCodes : [],
        cageCode: cageCode || "",
        duns: duns || "",
        capabilitiesSummary: capabilitiesSummary || "",
        certifications: Array.isArray(certifications) ? certifications : [],
        phone: phone || "",
        website: website || "",
      };

      return res.status(200).json({
        success: true,
        profile: profileStore,
      });
    } catch (error) {
      return res.status(400).json({
        error: "Failed to save profile",
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}

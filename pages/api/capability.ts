import type { NextApiRequest, NextApiResponse } from "next";

interface CapabilityRequest {
  companyName: string;
  naics: string[];
  psc: string[];
  capabilitiesSummary: string;
  differentiators: string;
  pastPerformance: string;
  certifications: string[];
  contactBlock: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const data = req.body as CapabilityRequest;

      // Validate required fields
      if (!data.companyName) {
        return res.status(400).json({ error: "Company name is required" });
      }

      // Generate capability statement
      const capabilityStatement = generateCapabilityStatement(data);

      res.status(200).json({ capabilityStatement });
    } catch (error) {
      console.error("Error generating capability statement:", error);
      res.status(500).json({ error: "Failed to generate capability statement" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

function generateCapabilityStatement(data: CapabilityRequest): string {
  const sections: string[] = [];

  // Header
  sections.push(`CAPABILITY STATEMENT`);
  sections.push(`\n${data.companyName}`);
  sections.push(`\n${"=".repeat(50)}\n`);

  // NAICS Codes
  if (data.naics.length > 0) {
    sections.push(`NAICS CODES:`);
    sections.push(data.naics.join(", "));
    sections.push("");
  }

  // PSC Codes
  if (data.psc.length > 0) {
    sections.push(`PSC CODES:`);
    sections.push(data.psc.join(", "));
    sections.push("");
  }

  // Certifications
  if (data.certifications.length > 0) {
    sections.push(`CERTIFICATIONS:`);
    sections.push(data.certifications.join(", "));
    sections.push("");
  }

  // Core Capabilities
  if (data.capabilitiesSummary) {
    sections.push(`CORE CAPABILITIES:`);
    sections.push(data.capabilitiesSummary);
    sections.push("");
  }

  // Differentiators
  if (data.differentiators) {
    sections.push(`DIFFERENTIATORS:`);
    sections.push(data.differentiators);
    sections.push("");
  }

  // Past Performance
  if (data.pastPerformance) {
    sections.push(`PAST PERFORMANCE:`);
    sections.push(data.pastPerformance);
    sections.push("");
  }

  // Contact Information
  if (data.contactBlock) {
    sections.push(`CONTACT INFORMATION:`);
    sections.push(data.contactBlock);
  }

  return sections.join("\n");
}

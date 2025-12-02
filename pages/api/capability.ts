import type { NextApiRequest, NextApiResponse } from 'next';

type CapabilityRequest = {
  companyName: string;
  naics: string[];
  psc: string[];
  capabilitiesSummary: string;
  differentiators: string;
  pastPerformance: string;
  certifications: string[];
  contactBlock: string;
};

type CapabilityResponse = {
  capabilityStatement?: string;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<CapabilityResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      companyName,
      naics,
      psc,
      capabilitiesSummary,
      differentiators,
      pastPerformance,
      certifications,
      contactBlock,
    } = req.body as CapabilityRequest;

    // Generate capability statement
    const capabilityStatement = generateCapabilityStatement({
      companyName,
      naics,
      psc,
      capabilitiesSummary,
      differentiators,
      pastPerformance,
      certifications,
      contactBlock,
    });

    res.status(200).json({ capabilityStatement });
  } catch (error) {
    console.error('Error generating capability statement:', error);
    res.status(500).json({ error: 'Failed to generate capability statement' });
  }
}

function generateCapabilityStatement(data: CapabilityRequest): string {
  const {
    companyName,
    naics,
    psc,
    capabilitiesSummary,
    differentiators,
    pastPerformance,
    certifications,
    contactBlock,
  } = data;

  let statement = '';

  // Company Header
  if (companyName) {
    statement += `${companyName.toUpperCase()}\n`;
    statement += `${'='.repeat(companyName.length)}\n\n`;
  }

  // NAICS Codes Section
  if (naics && naics.length > 0) {
    statement += `NAICS CODES\n`;
    statement += `${'-'.repeat(11)}\n`;
    naics.forEach((code) => {
      statement += `• ${code}\n`;
    });
    statement += '\n';
  }

  // PSC Codes Section
  if (psc && psc.length > 0) {
    statement += `PSC CODES\n`;
    statement += `${'-'.repeat(9)}\n`;
    psc.forEach((code) => {
      statement += `• ${code}\n`;
    });
    statement += '\n';
  }

  // Capabilities Summary
  if (capabilitiesSummary) {
    statement += `CORE CAPABILITIES\n`;
    statement += `${'-'.repeat(17)}\n`;
    statement += `${capabilitiesSummary}\n\n`;
  }

  // Differentiators
  if (differentiators) {
    statement += `DIFFERENTIATORS\n`;
    statement += `${'-'.repeat(15)}\n`;
    statement += `${differentiators}\n\n`;
  }

  // Past Performance
  if (pastPerformance) {
    statement += `PAST PERFORMANCE\n`;
    statement += `${'-'.repeat(16)}\n`;
    statement += `${pastPerformance}\n\n`;
  }

  // Certifications
  if (certifications && certifications.length > 0) {
    statement += `CERTIFICATIONS\n`;
    statement += `${'-'.repeat(14)}\n`;
    certifications.forEach((cert) => {
      statement += `• ${cert}\n`;
    });
    statement += '\n';
  }

  // Contact Information
  if (contactBlock) {
    statement += `CONTACT INFORMATION\n`;
    statement += `${'-'.repeat(19)}\n`;
    statement += `${contactBlock}\n`;
  }

  return statement;
}

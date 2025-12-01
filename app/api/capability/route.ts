import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  try {
    const body: CapabilityRequest = await request.json();

    const {
      companyName,
      naics,
      psc,
      capabilitiesSummary,
      differentiators,
      pastPerformance,
      certifications,
      contactBlock,
    } = body;

    // Validate required fields
    if (!companyName || !capabilitiesSummary) {
      return NextResponse.json(
        { error: "Company name and capabilities summary are required" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ capabilityStatement }, { status: 200 });
  } catch (error) {
    console.error("Error generating capability statement:", error);
    return NextResponse.json(
      { error: "Failed to generate capability statement" },
      { status: 500 }
    );
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

  let statement = `CAPABILITY STATEMENT\n`;
  statement += `${"=".repeat(50)}\n\n`;

  statement += `Company: ${companyName}\n\n`;

  if (naics && naics.length > 0 && naics[0]) {
    statement += `NAICS Codes:\n`;
    naics.forEach((code) => {
      if (code) statement += `  - ${code}\n`;
    });
    statement += `\n`;
  }

  if (psc && psc.length > 0 && psc[0]) {
    statement += `PSC Codes:\n`;
    psc.forEach((code) => {
      if (code) statement += `  - ${code}\n`;
    });
    statement += `\n`;
  }

  statement += `CAPABILITIES SUMMARY\n`;
  statement += `${"-".repeat(50)}\n`;
  statement += `${capabilitiesSummary}\n\n`;

  if (differentiators) {
    statement += `DIFFERENTIATORS\n`;
    statement += `${"-".repeat(50)}\n`;
    statement += `${differentiators}\n\n`;
  }

  if (pastPerformance) {
    statement += `PAST PERFORMANCE\n`;
    statement += `${"-".repeat(50)}\n`;
    statement += `${pastPerformance}\n\n`;
  }

  if (certifications && certifications.length > 0 && certifications[0]) {
    statement += `CERTIFICATIONS\n`;
    statement += `${"-".repeat(50)}\n`;
    certifications.forEach((cert) => {
      if (cert) statement += `  - ${cert}\n`;
    });
    statement += `\n`;
  }

  if (contactBlock) {
    statement += `CONTACT INFORMATION\n`;
    statement += `${"-".repeat(50)}\n`;
    statement += `${contactBlock}\n`;
  }

  return statement;
}

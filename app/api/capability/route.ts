import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";

const SYSTEM_CAPABILITY = `
You create professional 1–2 page capability statements for US government contracting.

Sections:
- Core Competencies
- Differentiators
- Past Performance (if provided)
- NAICS / PSC codes
- Certifications
- Contact Info

Use concise, federal-market language.
`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const companyName = (body.companyName as string) ?? "Your Company";
  const naics = (body.naics as string[]) ?? [];
  const psc = (body.psc as string[]) ?? [];
  const capabilitiesSummary =
    (body.capabilitiesSummary as string) ??
    "Government contracting services.";
  const differentiators = (body.differentiators as string) ?? "";
  const pastPerformance = (body.pastPerformance as string) ?? "";
  const certifications = (body.certifications as string[]) ?? [];
  const contactBlock =
    (body.contactBlock as string) ??
    "Phone: 000-000-0000 | Email: info@example.com";

  const prompt = `
Company Name: ${companyName}
NAICS Codes: ${naics.join(", ")}
PSC Codes: ${psc.join(", ")}
Capabilities Summary: ${capabilitiesSummary}
Differentiators: ${differentiators}
Past Performance: ${pastPerformance}
Certifications: ${certifications.join(", ")}
Contact: ${contactBlock}
`;

  const text = await chatCompletion(SYSTEM_CAPABILITY, prompt);
  return NextResponse.json({ capabilityStatement: text });
}

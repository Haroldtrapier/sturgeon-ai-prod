import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

const ANALYZER_SYSTEM = `
You are a government contracting requirements analyst.
Extract key requirements, evaluation factors, and compliance items.
Return them as structured bullet points.
`;

const OUTLINER_SYSTEM = `
You are a proposal architect.
Given analysis and company profile, design a compliant outline with headings/subheadings.
`;

const WRITER_SYSTEM = `
You are a senior federal proposal writer.
Write a full narrative proposal following the outline.
Use professional but plain language. Don't invent pricing.
`;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const rawRequirements = (body.rawRequirements as string) ?? "";
  const title = (body.title as string) ?? "Untitled Opportunity";
  const companyProfile =
    (body.companyProfile as string) ??
    "Trapier Management LLC – SDVOSB, logistics & AI solutions.";

  if (!rawRequirements.trim()) {
    return NextResponse.json(
      { error: "rawRequirements is required" },
      { status: 400 },
    );
  }

  const proposalId = randomUUID();
  db.proposals.create({
    id: proposalId,
    title,
    rawText: rawRequirements,
    ownerId: "dummy-user", // wire to real auth later
  });

  // 1) Analyze
  const analysis = await chatCompletion(
    ANALYZER_SYSTEM,
    rawRequirements,
  );

  // 2) Outline
  const outlinePrompt = `
ANALYSIS:
${analysis}

COMPANY PROFILE:
${companyProfile}

Create a detailed outline for this proposal.
`;
  const outline = await chatCompletion(OUTLINER_SYSTEM, outlinePrompt);

  // 3) Draft
  const draftPrompt = `
OUTLINE:
${outline}

COMPANY PROFILE:
${companyProfile}

Write the full proposal following this outline.
`;
  const draft = await chatCompletion(WRITER_SYSTEM, draftPrompt);

  return NextResponse.json({
    proposalId,
    analysis,
    outline,
    draft,
  });
}

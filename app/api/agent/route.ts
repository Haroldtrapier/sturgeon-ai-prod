import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";

const SYSTEM_PROMPT = `
You are the Sturgeon AI Government Contracting Assistant.
You help with: opportunity analysis, NAICS/PSC, SBA rules, proposals, certifications.
Keep answers concise and actionable.
`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const message = body.message as string | undefined;

  if (!message) {
    return NextResponse.json(
      { error: "message is required" },
      { status: 400 },
    );
  }

  try {
    const answer = await chatCompletion(SYSTEM_PROMPT, message);
    return NextResponse.json({ response: answer });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 },
    );
  }
}

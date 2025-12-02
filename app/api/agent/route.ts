import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { chatCompletion } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const message = (body.message as string) ?? "";

  if (!message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const systemPrompt = `
You are Sturgeon AI, a government contracting and grants assistant.
You help the user:
- Find, understand, and compare federal, state, and local opportunities.
- Interpret NAICS/PSC codes.
- Suggest next steps for proposals, certifications, and pricing.
Always answer clearly and practically for a small SDVOSB.
  `.trim();

  const reply = await chatCompletion(systemPrompt, message);

  return NextResponse.json({ reply });
}

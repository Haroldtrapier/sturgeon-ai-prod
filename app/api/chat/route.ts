import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";

const SYSTEM_CHAT = `
You are Sturgeon Chat Assistant.
Short, clear answers; focus on government contracting, Sturgeon features, and next steps.
`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const message = (body.message as string) ?? "";

  if (!message.trim()) {
    return NextResponse.json(
      { error: "message is required" },
      { status: 400 },
    );
  }

  const reply = await chatCompletion(SYSTEM_CHAT, message);
  return NextResponse.json({ reply });
}

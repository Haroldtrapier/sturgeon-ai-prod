import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openai";

const SYSTEM_CHAT = `
You are Sturgeon Chat Assistant.
Short, clear answers; focus on government contracting, Sturgeon features, and next steps.
`;

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const message = (body.message as string) ?? "";

  if (!message.trim()) {
    return NextResponse.json(
      { error: "message is required" },
      { status: 400 },
    );
  }

  try {
    const reply = await chatCompletion(SYSTEM_CHAT, message);
    return NextResponse.json({ reply });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Chat completion failed: ${errorMessage}` },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: { question?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const question = (body.question as string) ?? "";

  if (!question.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  // TODO: call Perplexity API when you have a key.
  // Placeholder response for now:
  return NextResponse.json({
    answer: `Placeholder research summary for: "${question}"`,
    citations: [],
  });
}

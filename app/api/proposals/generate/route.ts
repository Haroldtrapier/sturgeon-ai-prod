import { NextResponse } from "next/server";
import { requirePlan } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await requirePlan(user.id, "pro");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Plan upgrade required";
    return NextResponse.json({ error: message }, { status: 403 });
  }

  // Parse the request body
  let body: { opportunity_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  // Validate required fields
  if (!body.opportunity_id || typeof body.opportunity_id !== "string") {
    return NextResponse.json(
      { error: "opportunity_id is required and must be a string" },
      { status: 400 }
    );
  }

  // Generate proposal (placeholder implementation)
  return NextResponse.json({
    success: true,
    proposal: "Proposal generation ready - OpenAI integration pending",
    opportunity_id: body.opportunity_id,
    generated_at: new Date().toISOString(),
  });
}

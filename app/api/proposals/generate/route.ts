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
  const body = await request.json();

  // Generate proposal (placeholder implementation)
  return NextResponse.json({
    success: true,
    proposal: "Proposal generation ready - OpenAI integration pending",
    opportunity_id: body.opportunity_id,
    generated_at: new Date().toISOString(),
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const review = await prisma.humanReviewRequest.create({
    data: {
      userId: user.id,
      proposalId: body.proposalId ?? null,
      status: "pending",
      price: body.price ?? 149,
      notes: body.notes ?? null,
    },
  });

  return NextResponse.json({ review });
}

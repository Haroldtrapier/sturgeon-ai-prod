import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

function isValidPrice(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value) && value >= 0 && value <= 10000;
}

function isValidString(value: unknown): value is string {
  return typeof value === "string" && value.length <= 10000;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  // Validate proposalId if provided
  const proposalId = body.proposalId;
  if (proposalId !== undefined && proposalId !== null && !isValidString(proposalId)) {
    return NextResponse.json({ error: "Invalid proposalId" }, { status: 400 });
  }

  // Validate price if provided
  const price = body.price;
  if (price !== undefined && !isValidPrice(price)) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  // Validate notes if provided
  const notes = body.notes;
  if (notes !== undefined && notes !== null && !isValidString(notes)) {
    return NextResponse.json({ error: "Invalid notes" }, { status: 400 });
  }

  const review = await prisma.humanReviewRequest.create({
    data: {
      userId: user.id,
      proposalId: proposalId ?? null,
      status: "pending",
      price: price ?? 149,
      notes: notes ?? null,
    },
  });

  return NextResponse.json({ review });
}

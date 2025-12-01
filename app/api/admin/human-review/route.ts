import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// For now, assume only you use this route; later add role checks.

export async function GET() {
  const requests = await prisma.humanReviewRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const id = body.id as string | undefined;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const reqUpdated = await prisma.humanReviewRequest.update({
    where: { id },
    data: {
      status: body.status ?? undefined,
      notes: body.notes ?? undefined,
      resultPdfUrl: body.resultPdfUrl ?? undefined,
    },
  });

  return NextResponse.json({ request: reqUpdated });
}

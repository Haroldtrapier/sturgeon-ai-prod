import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const opp = await prisma.savedOpportunity.create({
    data: {
      userId: user.id,
      source: body.source ?? "manual",
      externalId: body.externalId ?? null,
      title: body.title ?? "Untitled",
      agency: body.agency ?? null,
      status: body.status ?? "watchlist",
      metadata: body.metadata ?? {},
    },
  });

  return NextResponse.json({ opportunity: opp });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const opps = await prisma.savedOpportunity.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ opportunities: opps });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wins = await prisma.win.findMany({
    where: { userId: user.id },
    orderBy: { dateWon: "desc" },
  });

  return NextResponse.json({ wins });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const win = await prisma.win.create({
    data: {
      userId: user.id,
      opportunityTitle: body.opportunityTitle ?? "Untitled Win",
      agency: body.agency ?? null,
      amount: body.amount ?? null,
      contractNumber: body.contractNumber ?? null,
      description: body.description ?? null,
      dateWon: body.dateWon ? new Date(body.dateWon) : null,
    },
  });

  return NextResponse.json({ win });
}

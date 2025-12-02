import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apps = await prisma.certificationApplication.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications: apps });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const app = await prisma.certificationApplication.create({
    data: {
      userId: user.id,
      certType: body.certType ?? "SDVOSB",
      status: body.status ?? "planning",
      notes: body.notes ?? null,
      checklist: body.checklist ?? {},
    },
  });

  return NextResponse.json({ application: app });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const id = body.id as string | undefined;
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const app = await prisma.certificationApplication.update({
    where: { id },
    data: {
      status: body.status ?? undefined,
      notes: body.notes ?? undefined,
      checklist: body.checklist ?? undefined,
    },
  });

  return NextResponse.json({ application: app });
}

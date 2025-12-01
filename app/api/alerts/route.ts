import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const searches = await prisma.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ savedSearches: searches });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const search = await prisma.savedSearch.create({
    data: {
      userId: user.id,
      name: body.name ?? "Unnamed Alert",
      query: body.query ?? "",
      marketplace: body.marketplace ?? null,
      params: body.params ?? {},
    },
  });

  return NextResponse.json({ savedSearch: search });
}

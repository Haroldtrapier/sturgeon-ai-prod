import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const results = [
    {
      id: "GOVSPEND-001",
      title: `Placeholder GovSpend opportunity for "${q}"`,
      agency: "Sample Local Buyer",
      status: "open",
      source: "govspend",
    },
  ];

  return NextResponse.json({ results });
}

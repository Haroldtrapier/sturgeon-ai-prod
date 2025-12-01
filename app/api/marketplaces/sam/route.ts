import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  // TODO: call real SAM.gov API
  const results = [
    {
      id: "SAM-001",
      title: `Placeholder SAM opp for "${q}"`,
      agency: "Dept. of Veterans Affairs",
      status: "open",
      source: "sam",
    },
  ];

  return NextResponse.json({ results });
}

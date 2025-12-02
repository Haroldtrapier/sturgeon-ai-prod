import { NextApiRequest, NextApiResponse } from "next";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { q = "" } = req.query;
  const query = Array.isArray(q) ? q[0] : q;

  const results = [
    {
      id: "GOVWIN-001",
      title: `Placeholder GovWin opportunity for "${query}"`,
      agency: "Sample Agency",
      status: "open",
      source: "govwin",
    },
  ];

  return res.status(200).json({ results });
}

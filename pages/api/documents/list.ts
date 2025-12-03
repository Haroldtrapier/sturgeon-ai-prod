import type { NextApiRequest, NextApiResponse } from "next";
import { documentStorage } from "@/lib/documentStorage";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const documents = documentStorage.getAll();
  return res.status(200).json({ documents });
}

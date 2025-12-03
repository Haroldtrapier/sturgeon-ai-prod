import type { NextApiRequest, NextApiResponse } from "next";
import { documentStorage } from "@/lib/documentStorage";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Document ID is required" });
  }

  const deleted = documentStorage.delete(id);

  if (!deleted) {
    return res.status(404).json({ error: "Document not found" });
  }

  return res.status(200).json({ success: true });
}

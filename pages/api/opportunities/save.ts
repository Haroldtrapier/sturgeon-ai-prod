import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, agency, source, status, metadata } = req.body;

    // Validate required fields
    if (!title || !source) {
      return res.status(400).json({ error: "Title and source are required" });
    }

    const { data, error } = await supabaseAdmin
      .from("opportunities")
      .insert([
        {
          title,
          agency: agency || null,
          source,
          status: status || "watchlist",
          metadata: metadata || {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ opportunity: data, success: true });
  } catch (error: any) {
    console.error("Error saving opportunity:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

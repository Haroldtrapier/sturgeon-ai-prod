import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ opportunities: data || [] });
  } catch (error: any) {
    console.error("Error fetching opportunities:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}

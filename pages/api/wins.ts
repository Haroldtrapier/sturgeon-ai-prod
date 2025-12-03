import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("wins")
        .select("*")
        .order("dateWon", { ascending: false });

      if (error) {
        console.error("Error fetching wins:", error);
        return res.status(500).json({ error: "Failed to fetch wins" });
      }

      return res.status(200).json({ wins: data || [] });
    } catch (error) {
      console.error("Unexpected error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const {
        opportunityTitle,
        agency,
        amount,
        contractNumber,
        description,
        dateWon,
      } = req.body;

      if (!opportunityTitle) {
        return res
          .status(400)
          .json({ error: "Opportunity title is required" });
      }

      const { data, error } = await supabase
        .from("wins")
        .insert([
          {
            opportunityTitle,
            agency: agency || null,
            amount: amount || null,
            contractNumber: contractNumber || null,
            description: description || null,
            dateWon: dateWon || null,
          },
        ])
        .select();

      if (error) {
        console.error("Error creating win:", error);
        return res.status(500).json({ error: "Failed to create win" });
      }

      return res.status(201).json({ win: data[0] });
    } catch (error) {
      console.error("Unexpected error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

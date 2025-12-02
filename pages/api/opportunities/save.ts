import type { NextApiRequest, NextApiResponse } from "next";

type SaveOpportunityRequest = {
  title: string;
  agency: string | null;
  source: string;
  externalId: string;
  status: string;
  metadata: Record<string, any>;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body: SaveOpportunityRequest = req.body;

    // Validate required fields
    if (!body.title || !body.source || !body.externalId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // In a real application, this would save to a database
    // For now, we'll just simulate a successful save
    console.log("Saving opportunity:", {
      title: body.title,
      agency: body.agency,
      source: body.source,
      externalId: body.externalId,
      status: body.status,
      metadata: body.metadata,
    });

    return res.status(200).json({
      success: true,
      message: "Opportunity saved successfully",
    });
  } catch (error) {
    console.error("Error saving opportunity:", error);
    return res.status(500).json({ error: "Failed to save opportunity" });
  }
}

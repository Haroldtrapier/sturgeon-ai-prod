import type { NextApiRequest, NextApiResponse } from "next";

type Recommendation = {
  proposalId: string;
  title: string;
  fitScore: number;
  source: string;
  why: string;
};

type ResponseData = {
  recommendations?: Recommendation[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    // Mock implementation - returns sample recommendations
    // In a real implementation, this would call an AI service to analyze the text
    // and match it against a database of historical proposals
    
    const mockRecommendations: Recommendation[] = [
      {
        proposalId: "PROP-2023-001",
        title: "Cloud Infrastructure Modernization for Federal Agency",
        fitScore: 0.89,
        source: "Historical Win",
        why: "Strong alignment with cloud migration requirements and federal compliance needs. Similar scope and technical requirements.",
      },
      {
        proposalId: "PROP-2023-015",
        title: "Cybersecurity Assessment and Implementation",
        fitScore: 0.76,
        source: "Historical Proposal",
        why: "Relevant experience in security frameworks and compliance. Matching keywords in scope of work.",
      },
      {
        proposalId: "PROP-2022-042",
        title: "DevOps Transformation Initiative",
        fitScore: 0.68,
        source: "Historical Win",
        why: "Overlapping technical capabilities and delivery approach. Similar contract vehicle and agency type.",
      },
    ];

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return res.status(200).json({
      recommendations: mockRecommendations,
    });
  } catch (error) {
    console.error("Error processing contract match:", error);
    return res.status(500).json({
      error: "Failed to process contract match request",
    });
  }
}

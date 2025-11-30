export default function handler(req, res) {
  res.status(200).json({
    service: "Sturgeon AI API",
    version: "2.0.0",
    status: "operational",
    endpoints: {
      opportunities: "/api/opportunities/search",
      grants: "/api/grants/search",
      analysis: "/api/ai/analyze-contract",
      proposals: "/api/ai/generate-proposal",
      matching: "/api/ai/match-opportunities",
      documents: "/api/documents/upload",
      health: "/api/health"
    }
  })
}

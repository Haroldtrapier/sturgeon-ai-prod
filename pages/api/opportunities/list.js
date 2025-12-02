export default function handler(req, res) {
  // Mock data for opportunities
  res.status(200).json({
    opportunities: [
      { id: 1, title: "Opportunity 1" },
      { id: 2, title: "Opportunity 2" },
      { id: 3, title: "Opportunity 3" }
    ]
  });
}

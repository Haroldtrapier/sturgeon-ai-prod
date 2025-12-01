export default function handler(req, res) {
  // Mock data for saved opportunities
  res.status(200).json({
    opportunities: [
      {
        id: 1,
        title: "Contract Opportunity 1",
        agency: "Department of Defense",
        savedDate: "2024-03-01"
      },
      {
        id: 2,
        title: "Grant Opportunity 1",
        agency: "Department of Energy",
        savedDate: "2024-03-05"
      },
      {
        id: 3,
        title: "Contract Opportunity 2",
        agency: "NASA",
        savedDate: "2024-03-10"
      }
    ]
  });
}

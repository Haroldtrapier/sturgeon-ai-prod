export default function handler(req, res) {
  // Mock data for wins
  res.status(200).json({
    wins: [
      {
        id: 1,
        title: "Example Win 1",
        date: "2024-01-15"
      },
      {
        id: 2,
        title: "Example Win 2",
        date: "2024-02-20"
      }
    ]
  });
}

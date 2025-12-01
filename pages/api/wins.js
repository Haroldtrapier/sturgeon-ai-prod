export default function handler(req, res) {
  // Mock data for wins
  res.status(200).json({
    wins: [
      { id: 1, title: "Contract Award 1" },
      { id: 2, title: "Contract Award 2" }
    ]
  });
}

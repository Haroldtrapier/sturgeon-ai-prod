export default function handler(req, res) {
  // Mock data for profile
  res.status(200).json({
    profile: {
      companyName: "Example Company Inc."
    }
  });
}

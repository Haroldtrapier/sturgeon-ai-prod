export default function handler(req, res) {
  // Mock data for user profile
  res.status(200).json({
    profile: {
      companyName: "Acme Corporation",
      naics: "541512",
      psc: "R425",
      certifications: ["8(a)", "HUBZone"]
    }
  });
}

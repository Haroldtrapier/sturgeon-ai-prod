import MarketplacePlaceholder from "../components/MarketplacePlaceholder";

export default function SamVendorPage() {
  return (
    <MarketplacePlaceholder
      name="SAM.gov Vendor Profile"
      loginUrl="https://sam.gov/"
      description="Your SAM.gov registration is the core of your federal identity. Sturgeon AI will help you tune your profile, codes, and certifications for the opportunities you want."
      bullets={[
        "Log into SAM.gov to view and update your entity registration.",
        "Review NAICS, PSC, and certification details.",
        "Copy your profile summary, codes, and certifications into Sturgeon.",
        "Let AI suggest adjustments to align with your target contracts.",
      ]}
      comingSoon={[
        "Profile tuning recommendations based on your target agencies.",
        "Gap analysis between your SAM profile and your pipeline.",
        "Checklists for annual renewal and updates.",
      ]}
    />
  );
}

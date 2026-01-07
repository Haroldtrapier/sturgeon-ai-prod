import MarketplacePlaceholder from "../components/MarketplacePlaceholder";

export default function GovSpendPage() {
  return (
    <MarketplacePlaceholder
      name="GovSpend"
      loginUrl="https://www.govspend.com/"
      description="GovSpend gives you visibility into historical spending and agency purchasing patterns. Sturgeon AI will help you turn those insights into targeted bids and outreach."
      bullets={
        [
          "Log into GovSpend to research what agencies are buying and from whom.",
          "Identify patterns in agency spend that match your NAICS and offerings.",
          "Export or copy opportunity and spend data into Sturgeon AI.",
          "Use Sturgeon to generate capture plans, outreach lists, and proposal angles.",
        ]
      }
      comingSoon={
        [
          "GovSpend-powered capture plan templates inside Sturgeon.",
          "AI recommendations based on historic spend patterns you export.",
          "Agency-specific talking points and outreach scripts.",
        ]
      }
    />
  );
}

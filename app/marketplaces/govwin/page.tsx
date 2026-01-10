import MarketplacePlaceholder from "../../components/MarketplacePlaceholder";

export default function GovWinPage() {
  return (
    <MarketplacePlaceholder
      name="GovWin"
      loginUrl="https://www.deltek.com/en/products/government-contracting/govwin"
      description="GovWin is a premium market intelligence platform. Use it to discover opportunities and forecasts, then plug your findings into Sturgeon AI for rapid analysis and proposal support."
      bullets={
        [
          "Log into GovWin with your organization's subscription.",
          "Identify upcoming opportunities, forecasts, and competitor intel.",
          "Copy or export opportunity details, forecasts, and notes into Sturgeon.",
          "Use Sturgeon to map requirements, draft proposals, and align your pipeline.",
        ]
      }
      comingSoon={
        [
          "GovWin-to-Sturgeon capture checklist templates.",
          "Opportunity scoring based on GovWin research you import.",
          "Auto-generated pursuit strategies and teaming suggestions.",
        ]
      }
    />
  );
}

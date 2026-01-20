import MarketplacePlaceholder from "../components/MarketplacePlaceholder";

export default function UnisonMarketplacePage() {
  return (
    <MarketplacePlaceholder
      name="Unison Marketplace"
      loginUrl="https://marketplace.unisonglobal.com/"
      description="Use your Unison Marketplace account to find micro-purchase and simplified acquisition opportunities, then bring those listings into Sturgeon AI for analysis, pricing, and proposal support."
      bullets={[
        "Log into Unison Marketplace in a separate tab with your own credentials.",
        "Search for micro-purchases, RFQs, and simplified acquisitions that match your NAICS and capabilities.",
        "Copy item details, scope text, and attachments into Sturgeon AI for instant analysis.",
        "Use Sturgeon to draft responses, build pricing, and track which opportunities you pursue.",
      ]}
      comingSoon={[
        "One-click 'Analyze this listing' workflow using copied Unison text.",
        "Pre-built bid templates for common Unison micro-purchase categories.",
        "Tracking board inside Sturgeon for all Unison bids and outcomes.",
        "Smart reminders for Unison opportunity closing times.",
      ]}
    />
  );
}

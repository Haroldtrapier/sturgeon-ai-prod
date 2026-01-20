import MarketplacePlaceholder from "../components/MarketplacePlaceholder";

export default function GsaEBuyPage() {
  return (
    <MarketplacePlaceholder
      name="GSA eBuy"
      loginUrl="https://www.ebuy.gsa.gov/"
      description="GSA eBuy is where schedule holders respond to RFQs. Sturgeon AI will help you analyze RFQs and generate schedule-compliant responses."
      bullets={[
        "Log into GSA eBuy with your GSA Schedule credentials.",
        "Browse and select RFQs that match your schedule SINs and NAICS.",
        "Copy RFQ text and requirements into Sturgeon's analysis tools.",
        "Generate compliant responses and proposal drafts with AI.",
      ]}
      comingSoon={[
        "RFQ response templates tailored for common GSA SINs.",
        "Checklist generation for each RFQ you paste into Sturgeon.",
        "Tracking board for all your GSA eBuy responses and awards.",
      ]}
    />
  );
}

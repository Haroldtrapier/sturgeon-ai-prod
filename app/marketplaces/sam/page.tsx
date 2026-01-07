import MarketplacePlaceholder from "../../components/MarketplacePlaceholder";

export default function SAMPage() {
  return (
    <MarketplacePlaceholder
      name="SAM.gov"
      loginUrl="https://sam.gov/"
      description="SAM.gov (System for Award Management) is the official U.S. government system that consolidates federal procurement systems and the Catalog of Federal Domestic Assistance into one system."
      bullets={[
        "Log into SAM.gov to search for active federal contracts.",
        "View opportunities by NAICS, agency, set-aside type, and more.",
        "Copy solicitation text and requirements into Sturgeon AI.",
        "Get instant AI analysis, compliance checks, and proposal drafts.",
      ]}
      comingSoon={[
        "Direct SAM.gov API integration for live opportunity feeds.",
        "Auto-import of opportunity attachments for AI analysis.",
        "Watchlist sync with your Sturgeon dashboard.",
        "One-click proposal kickstart from any SAM listing.",
      ]}
      color="emerald"
    />
  );
}

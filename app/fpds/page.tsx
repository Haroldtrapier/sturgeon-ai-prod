import MarketplacePlaceholder from "../components/MarketplacePlaceholder";

export default function FpdsPage() {
  return (
    <MarketplacePlaceholder
      name="FPDS / Beta.SAM (historical awards)"
      loginUrl="https://www.fpds.gov/"
      description="Use FPDS/Beta.SAM historical award data to understand how agencies buy, then feed that history into Sturgeon AI for strategy and pricing guidance."
      bullets={[
        "Log into FPDS or the current award history portal.",
        "Search for historical awards by NAICS, agency, or vendor.",
        "Export or copy award details into Sturgeon AI.",
        "Let Sturgeon summarize patterns, pricing ranges, and contract structures.",
      ]}
      comingSoon={[
        "Award history import helpers for FPDS export files.",
        "AI-generated price band estimates based on historical awards you provide.",
        "Automatic capture notes attached to your Sturgeon opportunities.",
      ]}
    />
  );
}

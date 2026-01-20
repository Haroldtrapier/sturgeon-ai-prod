import MarketplacePlaceholder from "../components/MarketplacePlaceholder";

export default function NasaSewpPage() {
  return (
    <MarketplacePlaceholder
      name="NASA SEWP"
      loginUrl="https://www.sewp.nasa.gov/"
      description="NASA SEWP is a major GWAC for IT products and services. Sturgeon AI will support SEWP holders with faster analysis of RFQs and ordering guides."
      bullets={[
        "Log into NASA SEWP as a contract holder or partner.",
        "Identify RFQs and task orders relevant to your catalog.",
        "Bring RFQ text and ordering guides into Sturgeon AI.",
        "Generate draft responses and internal checklists for SEWP orders.",
      ]}
      comingSoon={[
        "SEWP-tailored response templates for common RFQ types.",
        "Order checklist generation based on the text you paste.",
        "Historic SEWP trend summaries from exported data.",
      ]}
    />
  );
}

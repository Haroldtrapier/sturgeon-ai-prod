import MarketplacePlaceholder from "../components/MarketplacePlaceholder";

export default function GsaAdvantagePage() {
  return (
    <MarketplacePlaceholder
      name="GSA Advantage"
      loginUrl="https://www.gsaadvantage.gov/"
      description="GSA Advantage is your online catalog presence. Sturgeon AI will help you optimize listings, pricing, and positioning based on the data you export."
      bullets={[
        "Log into GSA Advantage as a schedule holder.",
        "Review your product or service listings and competitor offerings.",
        "Export or copy listing data into Sturgeon AI.",
        "Use AI to optimize descriptions, pricing strategies, and keywords.",
      ]}
      comingSoon={[
        "AI optimization suggestions for your GSA catalog text.",
        "Keyword and SEO-style recommendations for GSA searches.",
        "Competitor comparison briefs based on data you provide.",
      ]}
    />
  );
}

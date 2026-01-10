import MarketplacePlaceholder from "../../components/MarketplacePlaceholder";

export default function UsaSpendingPage() {
  return (
    <MarketplacePlaceholder
      name="USAspending.gov"
      loginUrl="https://www.usaspending.gov/"
      description="USAspending.gov shows how federal dollars are spent. Combine that transparency data with Sturgeon AI to decide where to focus your targeting and outreach."
      bullets={
        [
          "Use USAspending.gov to see which agencies spend in your NAICS.",
          "Download or copy spend reports for your target categories.",
          "Import key numbers into Sturgeon for analysis and strategy.",
          "Use AI to prioritize agencies, regions, and contract types.",
        ]
      }
      comingSoon={
        [
          "Templates to paste USAspending data and get instant insights.",
          "Heatmaps and breakdowns based on your imported spend data.",
          "AI suggestions on top 10 agencies to target by volume and fit.",
        ]
      }
    />
  );
}

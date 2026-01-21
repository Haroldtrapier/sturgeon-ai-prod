import MarketplaceImport from '@/components/MarketplaceImport';

export default function GovWinPage() {
  return (
    <MarketplaceImport
      source="govwin"
      sourceName="GovWin"
      loginUrl="https://www.deltek.com/en/products/government-contracting/govwin"
      description="Import opportunities and forecasts from GovWin. Use Sturgeon AI for rapid analysis and proposal support based on GovWin intelligence."
    />
  );
}

import MarketplaceImport from '@/components/MarketplaceImport';

export default function GovSpendPage() {
  return (
    <MarketplaceImport
      source="govspend"
      sourceName="GovSpend"
      loginUrl="https://www.govspend.com/"
      description="Import spending data and agency insights from GovSpend. Turn historical spending patterns into targeted opportunities and strategic positioning."
    />
  );
}

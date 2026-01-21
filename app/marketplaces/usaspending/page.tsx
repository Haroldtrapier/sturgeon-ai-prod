import MarketplaceImport from '@/components/MarketplaceImport';

export default function UsaSpendingPage() {
  return (
    <MarketplaceImport
      source="usaspending"
      sourceName="USASpending.gov"
      loginUrl="https://www.usaspending.gov/"
      description="Import federal spending data from USASpending.gov. Analyze trends, identify opportunities, and develop data-driven pursuit strategies."
    />
  );
}

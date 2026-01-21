import MarketplaceImport from '@/components/MarketplaceImport';

export default function FpdsPage() {
  return (
    <MarketplaceImport
      source="fpds"
      sourceName="FPDS / Beta.SAM"
      loginUrl="https://www.fpds.gov/"
      description="Import historical award data from FPDS/Beta.SAM. Analyze past contracts to understand agency buying patterns and develop competitive strategies."
    />
  );
}

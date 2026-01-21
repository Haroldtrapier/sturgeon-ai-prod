import MarketplaceImport from '@/components/MarketplaceImport';

export default function NasaSewpPage() {
  return (
    <MarketplaceImport
      source="nasa-sewp"
      sourceName="NASA SEWP"
      loginUrl="https://www.sewp.nasa.gov/"
      description="Import opportunities from NASA SEWP (Solutions for Enterprise-Wide Procurement). Analyze RFQs and build competitive IT solutions proposals."
    />
  );
}

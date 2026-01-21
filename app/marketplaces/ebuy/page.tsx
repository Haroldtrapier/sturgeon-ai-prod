import MarketplaceImport from '@/components/MarketplaceImport';

export default function EBuyPage() {
  return (
    <MarketplaceImport
      source="ebuy"
      sourceName="GSA eBuy"
      loginUrl="https://www.ebuy.gsa.gov/"
      description="Import RFQs from GSA eBuy. Respond to schedule holder requests with AI-powered analysis and compliant proposal generation."
    />
  );
}

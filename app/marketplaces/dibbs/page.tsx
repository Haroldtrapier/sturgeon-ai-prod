import MarketplaceImport from '@/components/MarketplaceImport';

export default function DibbsPage() {
  return (
    <MarketplaceImport
      source="dibbs"
      sourceName="DLA DIBBS"
      loginUrl="https://www.dibbs.bsm.dla.mil/"
      description="Import solicitations from Defense Logistics Agency DIBBS. Evaluate NSNs, quantities, and requirements with AI-powered analysis."
    />
  );
}

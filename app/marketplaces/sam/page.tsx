import MarketplaceImport from '@/components/MarketplaceImport';

export default function SamPage() {
  return (
    <MarketplaceImport
      source="sam"
      sourceName="SAM.gov"
      loginUrl="https://sam.gov/"
      description="Import contract opportunities from SAM.gov. Save solicitations, RFPs, and RFQs to Sturgeon AI for AI-powered analysis and response generation."
    />
  );
}

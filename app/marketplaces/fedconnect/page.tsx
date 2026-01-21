import MarketplaceImport from '@/components/MarketplaceImport';

export default function FedConnectPage() {
  return (
    <MarketplaceImport
      source="fedconnect"
      sourceName="FedConnect"
      loginUrl="https://www.fedconnect.net/"
      description="Import opportunities from FedConnect. Manage agency communications and respond to postings with AI-powered assistance from Sturgeon AI."
    />
  );
}

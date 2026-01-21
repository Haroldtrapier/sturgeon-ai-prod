import MarketplaceImport from '@/components/MarketplaceImport';

export default function SamVendorPage() {
  return (
    <MarketplaceImport
      source="sam-vendor"
      sourceName="SAM.gov Vendor Profile"
      loginUrl="https://sam.gov/"
      description="Import and optimize your SAM.gov vendor profile information. Ensure your capabilities and representations are competitive and up-to-date."
    />
  );
}

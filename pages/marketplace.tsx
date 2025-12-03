import React from 'react';
import MarketplacePlaceholder from '../components/MarketplacePlaceholder';

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">Marketplace Integrations</h1>
        
        <MarketplacePlaceholder title="SAM.gov" />
        <MarketplacePlaceholder title="GovWin IQ" />
        <MarketplacePlaceholder title="FedConnect" />
      </div>
    </div>
  );
}

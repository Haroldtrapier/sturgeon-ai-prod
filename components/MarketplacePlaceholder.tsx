import React from 'react';

/**
 * Props for the MarketplacePlaceholder component
 */
interface MarketplacePlaceholderProps {
  /** The title of the marketplace integration */
  title: string;
}

/**
 * A placeholder component for marketplace integrations.
 * Displays information about planned marketplace integrations including
 * the marketplace name and details about future functionality.
 * 
 * @param props - The component props
 * @returns A styled placeholder card for a marketplace integration
 */
export default function MarketplacePlaceholder({ title }: MarketplacePlaceholderProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-3 text-slate-300">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm">
        This module is a placeholder. You must log into your own account on
        this marketplace. Sturgeon AI will link to your portal and later
        support browser automations.
      </p>
      <div className="text-xs text-slate-500">
        Full integrations planned: saved searches, award feeds, agency trends,
        and linked proposal builder.
      </div>
    </div>
  );
}

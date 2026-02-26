// app/marketing/page.tsx
"use client";

import MarketingAgent from '@/components/MarketingAgent';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Marketing Agent
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Generate professional marketing content powered by AI
          </p>
        </div>
        
        <MarketingAgent />
      </div>
    </div>
  );
}
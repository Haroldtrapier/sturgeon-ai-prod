import React from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function TestAppShell() {
  return (
    <AppShell>
      <div className="text-white">
        <h1 className="text-3xl font-bold mb-4">AppShell Test Page</h1>
        <p className="text-gray-300">
          This page demonstrates the AppShell layout component with SideNav, TopBar, and main content area.
        </p>
        <div className="mt-8 p-4 bg-slate-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Features:</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Fixed width sidebar (w-60)</li>
            <li>TopBar with border and proper spacing</li>
            <li>Main content area with slate-950 background</li>
            <li>Responsive flex layout</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}

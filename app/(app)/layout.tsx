import React from 'react';
import Link from 'next/link';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav
        style={{
          width: '250px',
          backgroundColor: '#1a1a2e',
          color: 'white',
          padding: '20px',
        }}
      >
        <h2 style={{ marginBottom: '30px' }}>Sturgeon AI</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
              Dashboard
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/proposals" style={{ color: 'white', textDecoration: 'none' }}>
              Proposals
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/contractmatch" style={{ color: 'white', textDecoration: 'none' }}>
              Contract Match
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/documents" style={{ color: 'white', textDecoration: 'none' }}>
              Documents
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/capability" style={{ color: 'white', textDecoration: 'none' }}>
              Capability
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/certifications" style={{ color: 'white', textDecoration: 'none' }}>
              Certifications
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/wins" style={{ color: 'white', textDecoration: 'none' }}>
              Wins
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/opportunities" style={{ color: 'white', textDecoration: 'none' }}>
              Opportunities
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/alerts" style={{ color: 'white', textDecoration: 'none' }}>
              Alerts
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/marketplaces" style={{ color: 'white', textDecoration: 'none' }}>
              Marketplaces
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/billing" style={{ color: 'white', textDecoration: 'none' }}>
              Billing
            </Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link href="/settings" style={{ color: 'white', textDecoration: 'none' }}>
              Settings
            </Link>
          </li>
        </ul>
      </nav>
      <main style={{ flex: 1, padding: '20px' }}>{children}</main>
    </div>
  );
}

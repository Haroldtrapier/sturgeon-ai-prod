import React from 'react';

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
            <a href="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
              Dashboard
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="/proposals" style={{ color: 'white', textDecoration: 'none' }}>
              Proposals
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="/contractmatch" style={{ color: 'white', textDecoration: 'none' }}>
              Contract Match
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="/documents" style={{ color: 'white', textDecoration: 'none' }}>
              Documents
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="/capability" style={{ color: 'white', textDecoration: 'none' }}>
              Capability
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="/certifications" style={{ color: 'white', textDecoration: 'none' }}>
              Certifications
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="/wins" style={{ color: 'white', textDecoration: 'none' }}>
              Wins
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="/opportunities" style={{ color: 'white', textDecoration: 'none' }}>
              Opportunities
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="/alerts" style={{ color: 'white', textDecoration: 'none' }}>
              Alerts
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="/marketplaces" style={{ color: 'white', textDecoration: 'none' }}>
              Marketplaces
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="/billing" style={{ color: 'white', textDecoration: 'none' }}>
              Billing
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="/settings" style={{ color: 'white', textDecoration: 'none' }}>
              Settings
            </a>
          </li>
        </ul>
      </nav>
      <main style={{ flex: 1, padding: '20px' }}>{children}</main>
    </div>
  );
}

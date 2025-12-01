import React from 'react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Proposals', href: '/proposals' },
  { name: 'Contract Match', href: '/contractmatch' },
  { name: 'Documents', href: '/documents' },
  { name: 'Capability', href: '/capability' },
  { name: 'Certifications', href: '/certifications' },
  { name: 'Wins', href: '/wins' },
  { name: 'Opportunities', href: '/opportunities' },
  { name: 'Alerts', href: '/alerts' },
  { name: 'Marketplaces', href: '/marketplaces' },
  { name: 'Billing', href: '/billing' },
  { name: 'Settings', href: '/settings' },
];

export default function SideNav() {
  return (
    <nav>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {navItems.map((item) => (
          <li key={item.name} style={{ marginBottom: '10px' }}>
            <a 
              href={item.href}
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                display: 'block',
                padding: '8px 12px',
                borderRadius: '4px'
              }}
            >
              {item.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

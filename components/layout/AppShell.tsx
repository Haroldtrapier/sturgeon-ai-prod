import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ 
        width: '250px', 
        backgroundColor: '#1e293b', 
        color: 'white',
        padding: '20px'
      }}>
        <h2>Sturgeon AI</h2>
        {/* SideNav will go here */}
      </aside>
      <div style={{ flex: 1 }}>
        <header style={{ 
          height: '60px', 
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px'
        }}>
          {/* TopBar will go here */}
        </header>
        <main style={{ padding: '20px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

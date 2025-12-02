import React from 'react';

export interface TopBarProps {
  title?: string;
  children?: React.ReactNode;
}

export default function TopBar({ title, children }: TopBarProps) {
  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      {title && (
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
          {title}
        </h1>
      )}
      {children}
    </header>
  );
}

import React from 'react';

export interface SideNavProps {
  children?: React.ReactNode;
  width?: number;
}

export default function SideNav({ children, width = 240 }: SideNavProps) {
  return (
    <nav
      style={{
        width: `${width}px`,
        backgroundColor: '#f9fafb',
        borderRight: '1px solid #e5e7eb',
        height: '100%',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      {children}
    </nav>
  );
}

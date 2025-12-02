import React from 'react';
import TopBar, { TopBarProps } from './TopBar';
import SideNav, { SideNavProps } from './SideNav';

export interface AppShellProps {
  children?: React.ReactNode;
  topBar?: TopBarProps;
  sideNav?: SideNavProps;
}

export default function AppShell({ children, topBar, sideNav }: AppShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        fontFamily: 'sans-serif',
      }}
    >
      {topBar && <TopBar {...topBar} />}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {sideNav && <SideNav {...sideNav} />}
        <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

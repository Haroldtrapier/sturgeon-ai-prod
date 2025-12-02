import React from 'react';
import { SideNav } from '../components/layout/SideNav';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <SideNav />
      <main style={{ flex: 1, padding: '2rem' }}>
        <h1>Dashboard</h1>
        <p>This is the dashboard page with the SideNav component.</p>
      </main>
    </div>
  );
}

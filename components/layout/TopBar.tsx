import React from 'react';

export default function TopBar() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      width: '100%'
    }}>
      <div>
        {/* Breadcrumbs or search can go here */}
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span>User Name</span>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          backgroundColor: '#0070f3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          U
        </div>
      </div>
    </div>
  );
}

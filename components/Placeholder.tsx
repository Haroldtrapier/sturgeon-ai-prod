import React from 'react';

interface PlaceholderProps {
  title: string;
}

export default function Placeholder({ title }: PlaceholderProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#333' }}>
        {title}
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>
        This page is under construction. Check back soon!
      </p>
    </div>
  );
}

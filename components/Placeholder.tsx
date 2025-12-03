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
      <div style={{
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '20px',
          color: '#333'
        }}>
          {title}
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#666',
          marginBottom: '10px'
        }}>
          This page is under construction.
        </p>
        <p style={{ 
          fontSize: '1rem', 
          color: '#999'
        }}>
          Check back soon for updates!
        </p>
      </div>
    </div>
  );
}

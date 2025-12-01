import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
}

export default function Card({ children, title }: CardProps) {
  return (
    <div style={{ 
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      {title && <h3 style={{ marginTop: 0, marginBottom: '15px' }}>{title}</h3>}
      {children}
    </div>
  );
}

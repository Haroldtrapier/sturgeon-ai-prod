import React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  title?: string;
  style?: React.CSSProperties;
}

export default function Card({ children, title, style }: CardProps) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '16px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        ...style,
      }}
    >
      {title && (
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            marginTop: 0,
            marginBottom: '12px',
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

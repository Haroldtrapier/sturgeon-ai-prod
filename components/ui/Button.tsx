import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  };

  const variantStyles = {
    primary: { backgroundColor: '#0070f3', color: 'white' },
    secondary: { backgroundColor: '#64748b', color: 'white' },
    danger: { backgroundColor: '#dc2626', color: 'white' },
  };

  return (
    <button 
      style={{ ...baseStyles, ...variantStyles[variant] }}
      {...props}
    >
      {children}
    </button>
  );
}

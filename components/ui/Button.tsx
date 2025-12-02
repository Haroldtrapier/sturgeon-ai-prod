import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
  },
  secondary: {
    backgroundColor: '#6b7280',
    color: '#ffffff',
    border: 'none',
  },
  outline: {
    backgroundColor: 'transparent',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
  },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: '0.875rem' },
  md: { padding: '8px 16px', fontSize: '1rem' },
  lg: { padding: '12px 24px', fontSize: '1.125rem' },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  style,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      style={{
        borderRadius: '6px',
        fontWeight: 500,
        cursor: 'pointer',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

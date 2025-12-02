import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  style?: React.CSSProperties;
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
  },
  success: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  warning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  info: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
};

export default function Badge({ children, variant = 'default', style }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        fontSize: '0.75rem',
        fontWeight: 500,
        borderRadius: '9999px',
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

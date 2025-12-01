import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-lg border border-slate-800 bg-slate-900/40 p-6 ${className}`}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

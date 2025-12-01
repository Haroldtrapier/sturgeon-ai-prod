import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-lg border border-slate-700 bg-slate-800 p-6 ${className}`}>
      {children}
    </div>
  );
}

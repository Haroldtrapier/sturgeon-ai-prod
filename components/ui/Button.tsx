import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'ghost';
  className?: string;
}

export function Button({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'default',
  className = '' 
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed focus:ring-blue-500',
    ghost: 'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed focus:ring-slate-500'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

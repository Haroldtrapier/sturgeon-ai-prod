import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost";
  children: React.ReactNode;
}

export function Button({ 
  variant = "default", 
  children, 
  className = "",
  ...props 
}: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantStyles = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    ghost: "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800 focus:ring-slate-500"
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

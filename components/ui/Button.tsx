import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost";
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "default",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variantStyles = {
    default:
      "bg-slate-700 text-slate-50 hover:bg-slate-600 active:bg-slate-800",
    ghost:
      "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-slate-50",
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

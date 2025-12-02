import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`p-6 bg-slate-800 border border-slate-700 rounded-lg shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-slate-800 bg-slate-900/50 p-4 ${className}`}
    >
      {children}
    </div>
  );
}
